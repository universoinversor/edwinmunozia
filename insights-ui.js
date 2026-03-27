document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('publicInsightsContainer');
    if(!container) return;

    const modal = document.getElementById('articleModal');
    const closeBtn = document.getElementById('articleClose');

    // Cerrar modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    try {
        if (!window.db) throw new Error("Conexión a base de datos rechazada.");
        
        container.innerHTML = '<div class="center text-muted mono" style="grid-column:1/-1;">Extrayendo datos de la blockchain...</div>';
        const snapshot = await window.db.collection("insights").orderBy("date", "desc").get();
        
        let insights = [];
        snapshot.forEach(doc => insights.push({id: doc.id, ...doc.data()}));

        container.innerHTML = '';
        
        if(insights.length === 0) {
            container.innerHTML = '<p class="mono text-muted text-center" style="grid-column:1/-1;">Aún no hay casos de éxito públicos.</p>';
            return;
        }

        insights.forEach((i, index) => {
            const div = document.createElement('article');
            div.className = 'insight-card';
            div.style.animation = `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s forwards`;
            div.style.opacity = '0';

            const dateStr = new Date(i.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

            const imageHtml = i.image ? `<div class="insight-image" style="width:100%; height:180px; overflow:hidden; border-radius:12px; margin-bottom:15px; border:1px solid var(--b-1);"><img src="${i.image}" alt="${i.title}" style="width:100%; height:100%; object-fit:cover;"></div>` : '';

            div.innerHTML = `
                ${imageHtml}
                <div class="insight-meta">
                    <span class="insight-category">${i.category}</span>
                    <span class="insight-date">${dateStr}</span>
                </div>
                <h3 class="insight-title">${i.title}</h3>
                <p class="insight-excerpt">${i.excerpt}</p>
                <button class="insight-btn" data-id="${i.id}">Leer Análisis Completo <span style="font-size:1.2rem; transform:translateY(1px);">→</span></button>
            `;
            container.appendChild(div);
        });

        // Eventos para abrir modal
        document.querySelectorAll('.insight-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const article = insights.find(x => x.id === id);
                if(article) openArticle(article);
            });
        });

    } catch(e) {
        console.error("Error cargando insights:", e);
        container.innerHTML = '<div style="color:red" class="center mono">Error al conectar con la base de datos de casos.</div>';
    }

    function openArticle(article) {
        document.getElementById('modalCategory').textContent = article.category;
        document.getElementById('modalDate').textContent = new Date(article.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('modalTitle').textContent = article.title;
        
        // Convertir saltos de línea a <br> (Markdown básico o HTML simple soportado por defecto al inyectar)
        let formattedContent = article.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
        if(!formattedContent.startsWith('<p>')) formattedContent = '<p>' + formattedContent + '</p>';
        
        const modalImageHtml = article.image ? `<div style="width:100%; max-height:400px; overflow:hidden; border-radius:20px; margin-bottom:30px; border:1px solid var(--b-1);"><img src="${article.image}" alt="${article.title}" style="width:100%; height:100%; object-fit:cover;"></div>` : '';

        document.getElementById('modalContent').innerHTML = modalImageHtml + formattedContent;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
    }
});
