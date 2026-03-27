document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('servicesContainer');
    const academiaSection = document.getElementById('academia-section');
    const academiaGrid = document.getElementById('grid-academia');
    const loading = document.getElementById('marketplace-loading');

    const catLabels = {
        'marketing': '// 01 Marketing & Crecimiento',
        'estrategia': '// 02 Estrategia de Negocio',
        'dev': '// 03 Ingeniería Web3 & Dev',
        'ecommerce': '// 04 E-commerce & Escala',
        'academia': '// 05 Academia IA & Consultoría'
    };

    try {
        if (!window.db) throw new Error("Firebase no configurado");
        
        const querySnapshot = await window.db.collection("services").get();
        let categorizedServices = {
            'marketing': [], 'estrategia': [], 'dev': [], 'ecommerce': [], 'academia': []
        };
        let hasServices = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.active) {
                const cat = data.category || 'marketing';
                if(!categorizedServices[cat]) categorizedServices[cat] = [];
                categorizedServices[cat].push({id: doc.id, ...data});
                hasServices = true;
            }
        });

        container.innerHTML = '';
        loading.style.display = 'none';

        if (!hasServices) {
            container.innerHTML = '<p class="mono text-muted" style="text-align:center;">El catálogo se está actualizando. Por favor intenta más tarde.</p>';
        } else {
            // Render basic categories
            Object.keys(catLabels).forEach(key => {
                if (key !== 'academia' && categorizedServices[key] && categorizedServices[key].length > 0) {
                    const sectionHTML = `
                        <div class="category-section">
                            <h2 class="category-title" style="color:var(--t-1); border-color:var(--t-2);">
                                <span class="mono" style="font-size:1rem; color:var(--cyan)">${catLabels[key].split(' ')[0]} ${catLabels[key].split(' ')[1]}</span> 
                                ${catLabels[key].split(' ').slice(2).join(' ')}
                            </h2>
                            <div class="marketplace-grid" id="grid-${key}"></div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', sectionHTML);
                    const grid = document.getElementById(`grid-${key}`);
                    categorizedServices[key].forEach(s => {
                        grid.appendChild(createCard(s.id, s.title, s.price, s.desc, s.image, key));
                    });
                }
            });

            // Render Academia specifically
            if (categorizedServices['academia'] && categorizedServices['academia'].length > 0) {
                academiaSection.style.display = 'block';
                academiaGrid.innerHTML = '';
                categorizedServices['academia'].forEach(s => {
                    academiaGrid.appendChild(createCard(s.id, s.title, s.price, s.desc, s.image, 'academia'));
                });
            } else {
                academiaSection.style.display = 'block'; // Mostrar la academia de YT por defecto aunque no haya planes
            }
        }
        
    } catch (e) {
        console.warn("Falla de DB:", e);
        loading.innerHTML = '<div style="color:red">Error conectando con la blockchain.</div>';
    }

    // Modal Logic
    const modal = document.getElementById('orderModal');
    const closeBtn = document.getElementById('closeModal');
    const orderForm = document.getElementById('orderForm');

    closeBtn.addEventListener('click', () => { modal.classList.remove('active'); });

    // Delegación de eventos para comprar (document wide por si son dinámicos)
    document.addEventListener('click', (e) => {
        if(e.target.classList.contains('btn-buy')) {
            const id = e.target.dataset.id;
            const name = e.target.dataset.name;
            
            // Especial para 'Asesorías personalizadas al wpp' de Academia
            if(name.toLowerCase().includes('asesor') || name.toLowerCase().includes('wpp') || name.toLowerCase().includes('whatsapp')) {
                window.open(`https://wa.me/573183002448?text=Hola%20Edwin,%20me%20interesa%20una%20${encodeURIComponent(name)}`, '_blank');
                return;
            }

            document.getElementById('serviceId').value = id;
            document.getElementById('serviceNameInput').value = name;
            document.getElementById('modalServiceName').innerText = `> ${name}`;
            modal.classList.add('active');
        }
    });

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = orderForm.querySelector('button');
        submitBtn.innerText = "Procesando...";
        submitBtn.disabled = true;

        const customerName = document.getElementById('c-nombre').value;
        const phone = document.getElementById('c-phone').value;
        const email = document.getElementById('c-email').value;
        const budget = document.getElementById('c-budget').value;
        const notes = document.getElementById('c-notes').value;
        const serviceName = document.getElementById('serviceNameInput').value;

        const orderData = {
            serviceId: document.getElementById('serviceId').value,
            serviceName: serviceName,
            customerName: customerName,
            email: email,
            phone: phone,
            budget: budget,
            notes: notes,
            status: 'pending',
            date: new Date().toISOString()
        };

        try {
            if(window.db) {
                await window.db.collection("orders").add(orderData);
            }
            
            document.getElementById('orderSuccess').style.display = 'block';
            orderForm.style.display = 'none';

            // Generar prompt para WhatsApp automático
            const msg = `🚀 *Nuevo Brief de Proyecto*
            
*Servicio:* ${serviceName}
*Cliente:* ${customerName}
*Presupuesto:* ${budget}
*Detalles:* ${notes}

He enviado el brief a través de la plataforma web.`;

            const waUrl = `https://wa.me/573183002448?text=${encodeURIComponent(msg)}`;
            
            setTimeout(() => {
                window.open(waUrl, '_blank');
                modal.classList.remove('active');
                orderForm.reset();
                orderForm.style.display = 'block';
                document.getElementById('orderSuccess').style.display = 'none';
                submitBtn.innerText = "Enviar Brief →";
                submitBtn.disabled = false;
            }, 1500);

        } catch (error) {
            console.error("Error validando orden:", error);
            submitBtn.innerText = "Fallo de conexión. Intenta de nuevo";
            submitBtn.disabled = false;
        }
    });
});

function createCard(id, title, price, description, image, category) {
    const div = document.createElement('div');
    div.className = 'm-card';
    const isCotizar = price.toLowerCase().includes('cotizar');
    
    // Default Icons if no image provided
    const defaultIcons = {
        'marketing': 'https://cdn-icons-png.flaticon.com/512/1998/1998087.png', // Rocket/Ads
        'estrategia': 'https://cdn-icons-png.flaticon.com/512/1541/1541402.png', // Chess/Strategy
        'dev': 'https://cdn-icons-png.flaticon.com/512/606/606204.png', // Code/Terminal
        'ecommerce': 'https://cdn-icons-png.flaticon.com/512/1162/1162499.png', // Cart/Store
        'academia': 'https://cdn-icons-png.flaticon.com/512/2436/2436702.png' // Book/School
    };

    const imgUrl = image || defaultIcons[category] || defaultIcons['marketing'];

    div.innerHTML = `
        <div class="m-card__visual">
            <img src="${imgUrl}" alt="${title}" class="m-card__img" loading="lazy" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2961/2961248.png'">
        </div>
        <div class="m-card__content">
            <h3 class="m-card__title">${title}</h3>
            <span class="m-card__price" style="${isCotizar ? 'font-size:1.3rem; color:var(--t-1)' : ''}">${price}</span>
            <p class="m-card__desc">${description}</p>
            <button class="btn btn-primary btn-buy" data-id="${id}" data-name="${title}" style="margin-top:auto; width:100%; color: #000000 !important; background: var(--cyan); border:none; font-weight:700; box-shadow: 0 0 15px rgba(0, 212, 255, 0.4); border-radius: 10px; padding: 12px;">
                ${isCotizar ? 'Llenar Brief →' : 'Solicitar Plan →'}
            </button>
        </div>
    `;
    return div;
}

