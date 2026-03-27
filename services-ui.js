document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inyectar el Modal en el body (para no copiar HTML en todas las páginas)
    const modalHTML = `
    <div class="modal-overlay" id="orderModal">
        <div class="modal-content glass" style="max-height:90vh; overflow-y:auto; padding:30px;">
            <button class="modal-close" id="closeModal">&times;</button>
            <h3 class="m-card__title" style="margin-bottom: 5px; font-family:var(--f-display); color:var(--t-1);">Project Brief</h3>
            <p class="mono text-accent" id="modalServiceName" style="margin-bottom: 20px; color:var(--cyan);"></p>
            
            <form id="orderForm" class="contacto__form">
                <input type="hidden" id="serviceId">
                <input type="hidden" id="serviceNameInput">
                <input type="hidden" id="serviceCategoryInput">
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                    <div class="fgroup">
                        <label for="c-nombre" class="mono">Nombre / Empresa</label>
                        <input type="text" id="c-nombre" required placeholder="Tu nombre">
                    </div>
                    <div class="fgroup">
                        <label for="c-phone" class="mono">WhatsApp</label>
                        <input type="text" id="c-phone" required placeholder="+57...">
                    </div>
                </div>
                
                <div class="fgroup">
                    <label for="c-email" class="mono">Email</label>
                    <input type="email" id="c-email" required placeholder="tu@email.com">
                </div>

                <div class="fgroup">
                    <label for="c-budget" class="mono">Rango de inversión</label>
                    <select id="c-budget" required>
                        <option value="" disabled selected>Selecciona...</option>
                        <option value=">$500">Hasta $500 USD</option>
                        <option value="$500-$1000">$500 - $1,000 USD</option>
                        <option value="$1000-$5000">$1,000 - $5,000 USD</option>
                        <option value="+$5000">Más de $5,000 USD</option>
                        <option value="not_sure">Agendar sesión para estimar</option>
                    </select>
                </div>

                <div class="fgroup">
                    <label for="c-notes" class="mono">Detalles del proyecto</label>
                    <textarea id="c-notes" rows="3" required placeholder="Describe tus metas..."></textarea>
                </div>

                <button type="submit" class="btn btn--glow btn--full" style="width:100%; margin-top:10px;">Enviar Brief →</button>
            </form>
            <div class="form-ok" id="orderSuccess" style="display: none; margin-top: 15px; text-align:center; padding:10px; background:rgba(0,255,135,0.1); color:var(--green); border-radius:8px;">
                ✅ Brief recibido. Te contactaré al WhatsApp en menos de 24h.
            </div>
        </div>
    </div>
    <style>
        .marketplace-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
        .m-card { background: rgba(11, 15, 26, 0.6); backdrop-filter: blur(12px); border: 1px solid var(--b-1); border-radius: 20px; padding: 30px; display: flex; flex-direction: column; transition: 0.3s ease; }
        .m-card:hover { transform: translateY(-5px); border-color: rgba(0, 212, 255, 0.3); }
        .m-card__title { font-family: var(--f-display); font-size: 1.5rem; margin-bottom: 10px; color: var(--t-1); }
        .m-card__desc { font-size: 0.95rem; color: var(--t-2); line-height: 1.6; margin-bottom: 20px; flex-grow: 1; }
        .m-card__price { font-family: var(--f-mono); font-size: 1.8rem; font-weight: 700; color: var(--cyan); margin-bottom: 20px; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 10000; opacity: 0; pointer-events: none; transition: 0.3s ease; }
        .modal-overlay.active { opacity: 1; pointer-events: auto; }
        .modal-close { position: absolute; top: 15px; right: 20px; background: none; border: none; color: var(--t-1); font-size: 24px; cursor: pointer; transform: scale(1); transition: 0.2s ease; }
        .modal-close:hover { transform: scale(1.2); color: var(--cyan); }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('orderModal');
    const closeBtn = document.getElementById('closeModal');
    const orderForm = document.getElementById('orderForm');

    closeBtn.addEventListener('click', () => { modal.classList.remove('active'); });

    // 2. Buscar contenedores dinámicos en la página
    const containers = document.querySelectorAll('.dynamic-services');
    if(containers.length === 0) return; // No hay servicios que cargar en esta página

    // 3. Cargar servicios desde Firebase
    try {
        if (!window.db) throw new Error("Firebase no inicializado.");
        const snapshot = await window.db.collection("services").get();
        let allServices = [];
        snapshot.forEach(doc => allServices.push({id: doc.id, ...doc.data()}));

        containers.forEach(container => {
            const category = container.getAttribute('data-category'); 
            const filtered = allServices.filter(s => s.active && s.category === category);
            
            container.innerHTML = '';
            
            if(filtered.length === 0) {
                container.innerHTML = '<p class="mono text-muted text-center" style="grid-column:1/-1;">Catálogo en actualización...</p>';
                return;
            }

            filtered.forEach((s, index) => {
                const isCotizar = s.price.toLowerCase().includes('cotizar');
                // Create Card
                const div = document.createElement('div');
                div.className = 'm-card';
                // Add staggered animation delay
                div.style.animation = `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s forwards`;
                div.style.opacity = '0'; // Starts invisible

                div.innerHTML = `
                    <h3 class="m-card__title">${s.title}</h3>
                    <span class="m-card__price" style="${isCotizar ? 'font-size:1.3rem; color:var(--t-1)' : ''}">${s.price}</span>
                    <p class="m-card__desc">${s.desc}</p>
                    <button class="btn btn-primary btn-buy" data-id="${s.id}" data-name="${s.title}" data-cat="${s.category}" style="margin-top:auto; width:100%; color: #000000 !important; background: var(--cyan); border:none; font-weight:700; box-shadow: 0 0 15px rgba(0, 212, 255, 0.4); border-radius:10px; padding:12px;">
                        ${isCotizar ? 'Llenar Brief →' : 'Solicitar Plan →'}
                    </button>
                `;
                container.appendChild(div);
            });
        });

    } catch(e) {
        console.error("Error cargando servicios dinámicos:", e);
        containers.forEach(c => c.innerHTML = '<div style="color:red" class="center">Error conectando con el catálogo de servicios.</div>');
    }

    // 4. Delegar clicks en los botones de comprar
    document.addEventListener('click', (e) => {
        if(e.target.classList.contains('btn-buy')) {
            const btn = e.target;
            const name = btn.getAttribute('data-name');
            const id = btn.getAttribute('data-id');
            const cat = btn.getAttribute('data-cat');

            if(name.toLowerCase().includes('asesor') || name.toLowerCase().includes('wpp')) {
                window.open(`https://wa.me/573183002448?text=Hola%20Edwin,%20me%20interesa%20una%20${encodeURIComponent(name)}`, '_blank');
                return;
            }

            document.getElementById('serviceId').value = id;
            document.getElementById('serviceNameInput').value = name;
            document.getElementById('serviceCategoryInput').value = cat;
            document.getElementById('modalServiceName').innerText = `> ${name}`;
            modal.classList.add('active');
        }
    });

    // 5. Manejar el Formulario
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = orderForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Procesando...";
        submitBtn.disabled = true;

        const orderData = {
            serviceId: document.getElementById('serviceId').value,
            serviceName: document.getElementById('serviceNameInput').value,
            category: document.getElementById('serviceCategoryInput').value,
            customerName: document.getElementById('c-nombre').value,
            email: document.getElementById('c-email').value,
            phone: document.getElementById('c-phone').value,
            budget: document.getElementById('c-budget').value,
            notes: document.getElementById('c-notes').value,
            status: 'pending',
            date: new Date().toISOString()
        };

        try {
            if(window.db) {
                await window.db.collection("orders").add(orderData);
            }
            document.getElementById('orderSuccess').style.display = 'block';
            orderForm.style.display = 'none';
            setTimeout(() => {
                modal.classList.remove('active');
                orderForm.reset();
                orderForm.style.display = 'block';
                document.getElementById('orderSuccess').style.display = 'none';
                submitBtn.innerText = "Enviar Brief →";
                submitBtn.disabled = false;
            }, 3000);
        } catch(error) {
            console.error("Error guardando lead:", error);
            submitBtn.innerText = "Error. Intenta de nuevo";
            setTimeout(()=> { submitBtn.innerText="Enviar Brief →"; submitBtn.disabled=false; }, 2000);
        }
    });
});
