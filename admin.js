document.addEventListener('DOMContentLoaded', () => {
    const authView = document.getElementById('authView');
    const dashboardView = document.getElementById('dashboardView');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    // MOCK DATA PARA PRUEBAS (Cuando no hay Firebase)
    let mockServices = [
        { id: "1", title: "Auditoría Smart Contract", price: "$500", desc: "Análisis exhaustivo on-chain.", active: true },
        { id: "2", title: "Consultoría Growth Web3", price: "$200", desc: "1 Hora de sesión estratégica.", active: true }
    ];
    let mockOrders = [
        { id: "o1", date: new Date().toISOString(), customerName: "Carlos Dev", email: "carlos@test.com", phone: "+57300000", serviceName: "Consultoría Growth Web3", status: "pending" }
    ];

    // Autenticación State Observer
    if(window.auth) {
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                showDashboard(user.email);
            } else {
                showLogin();
            }
        });
    } else {
        console.warn("Firebase Auth no disponible. Usando modo simulación.");
        // Simulamos NO estar logueados al principio
    }

    // Login Handle
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;
        const btn = document.getElementById('loginBtn');
        const err = document.getElementById('loginError');

        btn.innerText = "Verificando...";
        err.style.display = 'none';

        try {
            if(window.auth) {
                await window.auth.signInWithEmailAndPassword(email, pass);
                // El observer onAuthStateChanged manejará el cambio
            } else {
                // Mock Login
                if(email === 'admin@admin.com' && pass === '123456') {
                    showDashboard(email);
                } else {
                    throw new Error("Credenciales inválidas (Prueba con admin@admin.com / 123456)");
                }
            }
        } catch (error) {
            err.innerText = error.message || "Error de autenticación.";
            err.style.display = 'block';
            btn.innerText = "Autenticar →";
        }
    });

    // Logout Handle
    logoutBtn.addEventListener('click', async () => {
        if(window.auth) {
            await window.auth.signOut();
        } else {
            showLogin();
        }
    });

    function showDashboard(email) {
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        document.getElementById('adminUserEmail').innerText = `Admin: ${email}`;
        loadOrders();
        loadServices();
    }

    function showLogin() {
        dashboardView.classList.add('hidden');
        authView.classList.remove('hidden');
        loginForm.reset();
        document.getElementById('loginBtn').innerText = "Autenticar →";
    }

    // Tabs Logic
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.add('hidden'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.remove('hidden');
        });
    });

    // Cargar Orders
    async function loadOrders() {
        const tbody = document.querySelector('#ordersTable tbody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Cargando...</td></tr>';
        
        try {
            let orders = [];
            if(window.db) {
                const snapshot = await window.db.collection("orders").get();
                snapshot.forEach(doc => orders.push({id: doc.id, ...doc.data()}));
            } else {
                orders = mockOrders;
            }

            tbody.innerHTML = '';
            orders.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(o => {
                const tr = document.createElement('tr');
                const d = new Date(o.date).toLocaleDateString();
                const statusColor = o.status === 'pending' ? 'var(--cyan)' : 'var(--green)';
                tr.innerHTML = `
                    <td class="mono" style="color:var(--t-2)">${d}</td>
                    <td><strong>${o.customerName}</strong><br><small style="color:var(--t-2)">${o.email}</small></td>
                    <td class="mono">${o.phone}</td>
                    <td>${o.serviceName}</td>
                    <td><span class="badge" style="color:${statusColor}; border-color:${statusColor}">${o.status.toUpperCase()}</span></td>
                `;
                tbody.appendChild(tr);
            });
        } catch(e) {
            tbody.innerHTML = '<tr><td colspan="5" style="color:red">Error cargando órdenes</td></tr>';
        }
    }

    // Cargar Servicios
    async function loadServices() {
        const list = document.getElementById('servicesList');
        list.innerHTML = '<div style="text-align:center">Cargando...</div>';

        try {
            let services = [];
            if(window.db) {
                const snapshot = await window.db.collection("services").get();
                snapshot.forEach(doc => services.push({id: doc.id, ...doc.data()}));
            } else {
                services = mockServices;
            }

            list.innerHTML = '';
            
            // Definir color de badge por categoria
            const catColors = {
                'marketing': 'var(--purple)',
                'estrategia': 'var(--cyan)',
                'dev': 'var(--green)',
                'ecommerce': 'var(--gold)',
                'academia': 'var(--t-1)'
            };

            services.forEach(s => {
                const div = document.createElement('div');
                div.style.padding = '15px';
                div.style.border = '1px solid var(--b-1)';
                div.style.borderRadius = '8px';
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';
                
                const catLabel = s.category ? s.category.toUpperCase() : 'GENERAL';
                const catColor = catColors[s.category] || 'var(--t-2)';

                div.innerHTML = `
                    <div>
                        <span class="mono" style="font-size:0.7rem; color:${catColor}; border:1px solid ${catColor}; padding:2px 6px; border-radius:4px; margin-bottom:5px; display:inline-block;">${catLabel}</span>
                        <div style="font-family:var(--f-display); color:var(--t-1);">${s.title} <span class="mono" style="color:var(--cyan)">${s.price}</span></div>
                        <div style="font-size:0.85rem; color:var(--t-2); margin-top:5px;">${s.desc}</div>
                        ${s.image ? `<div style="font-size:0.7rem; color:var(--cyan); margin-top:5px;">📸 Imagen configurada</div>` : ''}
                        <span class="badge" style="margin-top:10px; display:inline-block; opacity:${s.active?1:0.5}">${s.active ? 'PUBLICADO' : 'OCULTO'}</span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="action-btn" onclick="editService('${s.id}')">Editar</button>
                    </div>
                `;
                list.appendChild(div);
            });
        } catch(e) {
            list.innerHTML = '<div style="color:red">Error cargando servicios</div>';
        }
    }

    // Guardar / Editar Servicio
    const sForm = document.getElementById('serviceForm');
    sForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        const id = document.getElementById('editServiceId').value;
        const submitBtn = document.getElementById('s-submit');
        submitBtn.innerText = "Guardando...";

        const sData = {
            category: document.getElementById('s-category').value,
            title: document.getElementById('s-title').value,
            price: document.getElementById('s-price').value,
            image: document.getElementById('s-image').value,
            desc: document.getElementById('s-desc').value,
            active: document.getElementById('s-active').checked
        };

        try {
            if(window.db) {
                if(id) {
                    await window.db.collection("services").doc(id).update(sData);
                } else {
                    await window.db.collection("services").add(sData);
                }
            } else {
                if(id) {
                    const idx = mockServices.findIndex(x => x.id === id);
                    if(idx>-1) mockServices[idx] = {id, ...sData};
                } else {
                    mockServices.push({id: "mock-"+Date.now(), ...sData});
                }
            }
            sForm.reset();
            document.getElementById('editServiceId').value = '';
            submitBtn.innerText = "Guardar Servicio";
            loadServices();
        } catch(e) {
            console.error(e);
            submitBtn.innerText = "Error";
            setTimeout(()=> submitBtn.innerText="Guardar Servicio", 2000);
        }
    });

    // Helper global para editar (inyectado via innerHTML)
    window.editService = async (id) => {
        document.querySelector('[data-target="panel-services"]').click();
        try {
            let svc;
            if(window.db) {
                const snapshot = await window.db.collection("services").get();
                snapshot.forEach(d => { if(d.id === id) svc = {id: d.id, ...d.data()} });
            } else {
                svc = mockServices.find(x => x.id === id);
            }

            if(svc) {
                document.getElementById('editServiceId').value = svc.id;
                document.getElementById('s-category').value = svc.category || '';
                document.getElementById('s-title').value = svc.title;
                document.getElementById('s-price').value = svc.price;
                document.getElementById('s-image').value = svc.image || '';
                document.getElementById('s-desc').value = svc.desc;
                document.getElementById('s-active').checked = svc.active;
                document.getElementById('s-submit').innerText = "Actualizar Servicio";
            }
        } catch(e) { console.error(e); }
    };

    // ==========================================
    // SECCIÓN INSIGHTS (BLOG CMS)
    // ==========================================

    async function loadInsights() {
        const list = document.getElementById('insightsList');
        if(!list) return;
        list.innerHTML = '<div class="center text-muted">Cargando...</div>';

        try {
            let insights = [];
            if(window.db) {
                const snapshot = await window.db.collection("insights").orderBy("date", "desc").get();
                snapshot.forEach(doc => insights.push({id: doc.id, ...doc.data()}));
            }

            if(insights.length === 0) {
                list.innerHTML = '<div class="center text-muted">No hay insights publicados aún.</div>';
                return;
            }

            list.innerHTML = '';
            insights.forEach(i => {
                const div = document.createElement('div');
                div.style.padding = '15px';
                div.style.border = '1px solid var(--b-1)';
                div.style.borderRadius = '8px';
                div.style.marginBottom = '10px';
                
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between;">
                        <span class="mono" style="font-size:0.7rem; color:var(--cyan); border:1px solid var(--cyan); padding:2px 6px; border-radius:4px;">${i.category}</span>
                        <span style="font-size:0.8rem; color:var(--t-2)">${new Date(i.date).toLocaleDateString()}</span>
                    </div>
                    <h4 style="margin: 8px 0; color:var(--t-1);">${i.title}</h4>
                    <p style="font-size:0.85rem; color:var(--t-2);">${i.excerpt}</p>
                    <button class="action-btn" style="margin-top:10px" onclick="deleteInsight('${i.id}')">Eliminar</button>
                    <button class="action-btn" style="margin-top:10px; margin-left:10px;" onclick="window.open('insights.html', '_blank')">Ver Página</button>
                `;
                list.appendChild(div);
            });
        } catch(e) {
            console.warn(e);
            list.innerHTML = '<div style="color:red">Aún no hay base de datos de insights.</div>';
        }
    }

    const iForm = document.getElementById('insightForm');
    if(iForm) {
        iForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnSubmitInsight');
            btn.innerText = 'Publicando...';
            btn.disabled = true;

            const data = {
                title: document.getElementById('i-title').value,
                category: document.getElementById('i-category').value,
                excerpt: document.getElementById('i-excerpt').value,
                image: document.getElementById('i-image').value,
                content: document.getElementById('i-content').value,
                date: new Date().toISOString()
            };

            try {
                if(window.db) {
                    await window.db.collection("insights").add(data);
                    alert("✅ Insight publicado!");
                }
                iForm.reset();
                loadInsights();
            } catch(error) {
                alert("Error: " + error.message);
            } finally {
                btn.innerText = 'Publicar Insight';
                btn.disabled = false;
            }
        });
    }

    window.deleteInsight = async (id) => {
        if(!confirm("¿Seguro que deseas eliminar este insight permanentemente?")) return;
        try {
            if(window.db) await window.db.collection("insights").doc(id).delete();
            loadInsights();
        } catch(e) {
            alert("Error eliminando insight: " + e.message);
        }
    };

    // Llamamos a loadInsights en start
    if(window.auth) {
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                loadInsights();
                loadDynamicContent();
            }
        });
    }

    // ==========================================
    // SECCIÓN CONTENIDO DINÁMICO (BLOG HERO & MEDIA)
    // ==========================================
    async function loadDynamicContent() {
        if(!window.db) return;
        try {
            // Load Blog Hero
            const heroDoc = await window.db.collection("settings").doc("blog_hero").get();
            if(heroDoc.exists) {
                const data = heroDoc.data();
                document.getElementById('h-active').checked = data.active || false;
                document.getElementById('h-title').value = data.title || '';
                document.getElementById('h-text').value = data.text || '';
                document.getElementById('h-link').value = data.link || '';
                document.getElementById('h-btnText').value = data.btnText || '';
                const pages = data.pages || [];
                document.querySelectorAll('.h-page').forEach(cb => {
                    cb.checked = pages.includes(cb.value);
                });
            }
            
            // Load Media Config
            const mediaDoc = await window.db.collection("settings").doc("page_media").get();
            if(mediaDoc.exists) {
                const data = mediaDoc.data();
                document.getElementById('v-diplomado').value = data.diplomadoVideo || '';
                document.getElementById('p-diplomado').value = data.diplomadoPoster || '';
                document.getElementById('v-marketing').value = data.marketingVideo || '';
                document.getElementById('p-marketing').value = data.marketingPoster || '';
            }
        } catch(e) { console.error("Error cargando content dinámico:", e); }
    }

    const hForm = document.getElementById('heroForm');
    if(hForm) {
        hForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('h-submit');
            btn.innerText = "Guardando...";
            const pages = [];
            document.querySelectorAll('.h-page:checked').forEach(cb => pages.push(cb.value));
            
            const data = {
                active: document.getElementById('h-active').checked,
                title: document.getElementById('h-title').value,
                text: document.getElementById('h-text').value,
                link: document.getElementById('h-link').value,
                btnText: document.getElementById('h-btnText').value,
                pages: pages,
                updatedAt: new Date().toISOString()
            };
            try {
                if(window.db) await window.db.collection("settings").doc("blog_hero").set(data);
                alert("✅ Blog Hero actualizado correctamente");
            } catch(e) { alert("Error: " + e.message); }
            btn.innerText = "Guardar Blog Hero";
        });
    }

    const mForm = document.getElementById('mediaForm');
    if(mForm) {
        mForm.addEventListener('submit', async(e) => {
            e.preventDefault();
            const btn = document.getElementById('m-submit');
            btn.innerText = "Guardando...";
            const data = {
                diplomadoVideo: document.getElementById('v-diplomado').value,
                diplomadoPoster: document.getElementById('p-diplomado').value,
                marketingVideo: document.getElementById('v-marketing').value,
                marketingPoster: document.getElementById('p-marketing').value,
                updatedAt: new Date().toISOString()
            };
            try {
                if(window.db) await window.db.collection("settings").doc("page_media").set(data);
                alert("✅ Configuración de Videos actualizada");
            } catch(e) { alert("Error: " + e.message); }
            btn.innerText = "Guardar Configuración de Videos";
        });
    }

    // Script autoinyectable para crear el catálogo de manera automática
    window.seedDatabase = async () => {
        if (!window.db) return alert("Firebase no conectado");
        const btn = document.getElementById('btnSeed');
        btn.innerText = "⏳ Creando el catálogo (Espere...)";
        btn.disabled = true;

        const defaultPackages = [
            // Marketing
            { category: "marketing", title: "Plan Starter", price: "$200 USD", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", desc: "Gestión básica de pauta, creación de copy y setup de campañas.", active: true },
            { category: "marketing", title: "Plan Pro", price: "$600 USD", image: "https://images.unsplash.com/photo-1551288049-bbda0231f1dc?auto=format&fit=crop&q=80&w=800", desc: "Escala con IA, automatizaciones de embudos y optimización de leads diaria.", active: true },
            { category: "marketing", title: "Agencias", price: "Cotizar", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800", desc: "Infraestructura completa y marca blanca para agencias B2B.", active: true },
            // Estrategia
            { category: "estrategia", title: "Plan Starter", price: "$200 USD", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800", desc: "Auditoría de tu negocio y roadmap estratégico de 3 meses.", active: true },
            { category: "estrategia", title: "Plan Pro", price: "$600 USD", image: "https://images.unsplash.com/photo-1454165833772-d99628a5ffef?auto=format&fit=crop&q=80&w=800", desc: "Consultoría 1 on 1, diseño de modelos RWA o tokenomics avanzados.", active: true },
            { category: "estrategia", title: "Agencias", price: "Cotizar", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800", desc: "Estrategia institucional y transformación digital profunda.", active: true },
            // Dev
            { category: "dev", title: "Plan Starter", price: "$500 USD", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800", desc: "Despliegue de landing page Web3 o Smart Contract básico.", active: true },
            { category: "dev", title: "Plan Pro", price: "$999 USD", image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800", desc: "DApp completa, integración web3 y auditoría de código.", active: true },
            { category: "dev", title: "Agencias", price: "Cotizar", image: "https://images.unsplash.com/photo-1644088379091-d574269d422f?auto=format&fit=crop&q=80&w=800", desc: "Desarrollo in-house para sistemas distribuidos complejos.", active: true },
            // Ecommerce
            { category: "ecommerce", title: "Tienda Básica", price: "$500 USD", image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800", desc: "Setup en Shopify/WooCommerce, pasarelas de pago y catálogo básico.", active: true },
            { category: "ecommerce", title: "Personalizada", price: "$999 USD", image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800", desc: "Diseño premium a medida, automatización de correos y funnels de venta.", active: true },
            { category: "ecommerce", title: "Megatienda", price: "Cotizar", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800", desc: "Ecosistema B2C complejo con integraciones ERP/CRM.", active: true }
        ];

        try {
            const batch = window.db.batch();
            defaultPackages.forEach(pkg => {
                const docRef = window.db.collection("services").doc();
                batch.set(docRef, pkg);
            });
            await batch.commit();
            alert("✅ Catálogo inicial creado con éxito!");
            loadServices();
        } catch(e) {
            console.error(e);
            alert("Hubo un error inyectando los datos en Firebase: " + (e.message || "Error desconocido. Revisa la consola(F12) o tus reglas de Firestore."));
        } finally {
            btn.innerText = "🚀 Autocompletar Catálogo Inicial";
            btn.disabled = false;
        }
    };
});
