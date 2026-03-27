document.addEventListener('DOMContentLoaded', () => {
    // 1. Inyectar HTML del Agente IA
    const aiHTML = `
    <!-- Botón FLotante IA -->
    <button class="ai-fab" id="aiFab" aria-label="Abrir Asistente IA">
        <div class="ai-fab__core"></div>
        <div class="ai-fab__ring"></div>
        <i data-lucide="bot"></i>
    </button>

    <!-- Ventana de Chat IA -->
    <div class="ai-chat glass" id="aiChat">
        <div class="ai-chat__header">
            <div class="ai-avatar">
                <i data-lucide="cpu" style="color:var(--cyan); width:18px; height:18px;"></i>
            </div>
            <div>
                <h4 class="ai-chat__title mono">Nexus AI</h4>
                <div class="ai-chat__status"><span class="status-dot"></span> Sistemas en línea</div>
            </div>
            <button class="ai-chat__close" id="aiClose">&times;</button>
        </div>
        
        <div class="ai-chat__body" id="aiChatBody">
            <!-- Mensajes inyectados dinámicamente -->
        </div>

        <div class="ai-chat__input">
            <div class="ai-chat__typing" id="aiTyping" style="display:none;">
                <span></span><span></span><span></span>
            </div>
            <div class="ai-options" id="aiOptions"></div>
        </div>
    </div>

    <style>
        .ai-fab { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; border-radius: 50%; background: var(--bg-card); border: 1px solid rgba(0,212,255,0.3); color: var(--cyan); cursor: pointer; z-index: 9999; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0,212,255,0.2); transition: 0.3s ease; }
        .ai-fab:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(0,212,255,0.4); }
        .ai-fab__core { position: absolute; width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%); animation: pulseCore 2s infinite; }
        .ai-fab__ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 1px solid rgba(0,212,255,0.5); animation: spinRing 4s linear infinite; }
        
        .ai-chat { position: fixed; bottom: 100px; right: 30px; width: 340px; height: 480px; max-height: calc(100vh - 120px); border-radius: 16px; border: 1px solid var(--b-1); display: flex; flex-direction: column; z-index: 9998; opacity: 0; pointer-events: none; transform: translateY(20px); transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden; background: rgba(11,15,26,0.85); backdrop-filter: blur(16px); }
        .ai-chat.active { opacity: 1; pointer-events: auto; transform: translateY(0); }
        
        .ai-chat__header { padding: 15px 20px; border-bottom: 1px solid var(--b-1); display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); }
        .ai-avatar { width: 36px; height: 36px; border-radius: 8px; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); display: flex; align-items: center; justify-content: center; }
        .ai-chat__title { margin: 0; font-size: 1rem; color: var(--t-1); }
        .ai-chat__status { font-size: 0.75rem; color: var(--t-2); display: flex; align-items: center; gap: 6px; }
        .ai-chat__status .status-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; box-shadow: 0 0 8px var(--green); }
        .ai-chat__close { margin-left: auto; background: none; border: none; color: var(--t-2); font-size: 20px; cursor: pointer; transition: 0.2s; }
        .ai-chat__close:hover { color: var(--pink); }

        .ai-chat__body { flex-grow: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; scroll-behavior: smooth; }
        .ai-chat__body::-webkit-scrollbar { width: 4px; }
        .ai-chat__body::-webkit-scrollbar-thumb { background: var(--b-2); border-radius: 4px; }

        .ai-msg { max-width: 85%; font-size: 0.9rem; line-height: 1.5; padding: 12px 16px; border-radius: 12px; animation: popIn 0.3s ease; }
        .ai-msg--bot { background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.1); color: var(--t-1); border-bottom-left-radius: 4px; align-self: flex-start; }
        .ai-msg--user { background: var(--cyan); color: #000; border-bottom-right-radius: 4px; align-self: flex-end; font-weight: 500; }
        
        .ai-chat__input { padding: 15px; border-top: 1px solid var(--b-1); background: rgba(0,0,0,0.2); min-height: 80px; }
        
        .ai-options { display: flex; flex-direction: column; gap: 8px; }
        .ai-opt-btn { background: rgba(0,212,255,0.2); border: 1px solid rgba(0,212,255,0.5); color: #ffffff !important; font-weight: 800; padding: 12px 18px; border-radius: 10px; font-size: 0.9rem; cursor: pointer; text-align: left; transition: 0.2s; font-family: var(--f-mono); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .ai-opt-btn:hover { background: var(--cyan); border-color: var(--cyan); color: #000000 !important; transform: translateX(5px); }
        
        .ai-chat__typing { display: flex; gap: 4px; padding: 10px 15px; background: rgba(0,212,255,0.05); border-radius: 12px; width: fit-content; align-self: flex-start; margin-bottom: 10px; }
        .ai-chat__typing span { width: 6px; height: 6px; background: var(--cyan); border-radius: 50%; opacity: 0.4; animation: typePulse 1.4s infinite; }
        .ai-chat__typing span:nth-child(2) { animation-delay: 0.2s; }
        .ai-chat__typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes pulseCore { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0.8; } 100% { transform: scale(0.8); opacity: 0.5; } }
        @keyframes spinRing { 100% { transform: rotate(360deg); } }
        @keyframes popIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes typePulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
        
        @media (max-width: 768px) {
            .ai-chat { width: calc(100% - 40px); right: 20px; bottom: 100px; height: 500px; }
            .ai-fab { bottom: 20px; right: 20px; }
        }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', aiHTML);
    if(window.lucide) lucide.createIcons();

    // 2. Elementos
    const fab = document.getElementById('aiFab');
    const chat = document.getElementById('aiChat');
    const closeBtn = document.getElementById('aiClose');
    const body = document.getElementById('aiChatBody');
    const optionsContainer = document.getElementById('aiOptions');
    const typingIndicator = document.getElementById('aiTyping');

    let chatOpen = false;
    let hasStarted = false;
    let leadData = { service: '', budget: '' };

    // 3. Eventos básicos
    fab.addEventListener('click', () => {
        chatOpen = !chatOpen;
        chat.classList.toggle('active', chatOpen);
        if (chatOpen && !hasStarted) {
            startConversation();
        }
    });

    closeBtn.addEventListener('click', () => {
        chatOpen = false;
        chat.classList.remove('active');
    });

    // 4. Lógica de Árbol de Diálogo (Máquina de Estados)
    const appendMsg = (text, type = 'bot', isHTML = false) => {
        const div = document.createElement('div');
        div.className = `ai-msg ai-msg--${type}`;
        if(isHTML) div.innerHTML = text;
        else div.textContent = text;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    };

    const removeTyping = () => {
        // The typingIndicator is a single element, so we just hide it.
        // If there were multiple dynamic typing indicators, we would query and remove them.
        typingIndicator.style.display = 'none';
    };

    const showTyping = (duration) => {
        return new Promise(resolve => {
            typingIndicator.style.display = 'flex';
            body.appendChild(typingIndicator); // Mover al final
            body.scrollTop = body.scrollHeight;
            setTimeout(() => {
                removeTyping(); // Use the new removeTyping function
                resolve();
            }, duration);
        });
    };

    const showOptions = (options, callback) => {
        optionsContainer.innerHTML = '';
        options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'ai-opt-btn';
            btn.style.animation = `popIn 0.3s ease ${index * 0.1}s backwards`;
            btn.textContent = `> ${opt.label}`;
            btn.onclick = () => {
                optionsContainer.innerHTML = ''; // Ocultar opciones
                appendMsg(opt.label, 'user');
                callback(opt.value);
            };
            optionsContainer.appendChild(btn);
        });
    };

    const startConversation = async () => {
        hasStarted = true;
        await showTyping(1500);
        appendMsg("Hola 👋 Soy Nexus, la IA de asistencia de Edwin Muñoz Isaza.");
        await showTyping(1800);
        appendMsg("Estoy analizando tu perfil de visitante... ¡Todo perfecto! 🚀");
        await showTyping(1500);
        appendMsg("¿En qué te puedo ayudar hoy? Selecciona una de las opciones más frecuentes:");
        
        showOptions([
            { label: '¿Quién es Edwin?', value: 'quien' },
            { label: '¿Cuál es su ROI / Casos?', value: 'roi' },
            { label: '¿Cómo empiezo?', value: 'empezar' }
        ], handleFAQSelect);
    };

    const handleFAQSelect = async (faqVal) => {
        leadData.faq = faqVal;
        
        if (faqVal === 'quien') {
            await showTyping(2000);
            appendMsg("Edwin es un <strong>Arquitecto Web3</strong> y Especialista en Growth con más de 12 años de experiencia en DeFi e IA. 🧠", 'bot', true);
            await showTyping(2500);
            appendMsg("Básicamente, se encarga de diseñar sistemas digitales que escalan capital y automatizan procesos de venta sin intervención humana.");
            await showTyping(2000);
            appendMsg("¿Te gustaría hablar directamente con él para ver cómo puede aplicar esto a tu caso?");
        } else if (faqVal === 'roi') {
            await showTyping(2500);
            appendMsg("Buena pregunta. Sus estrategias de Copytrading han mantenido un ROI histórico auditado de <strong>+150% anual</strong>. 📈", 'bot', true);
            await showTyping(2800);
            appendMsg("Todo esto es posible gracias a una gestión de riesgo estricta controlada por algoritmos propios.");
            await showTyping(2500);
            appendMsg("Además, ha escalado e-commerces y negocios locales multiplicando sus conversiones con pauta estratégica.");
            await showTyping(2000);
            appendMsg("¿Te gustaría agendar una revisión o sesión estratégica con él directo en su WhatsApp?");
        } else if (faqVal === 'empezar') {
            await showTyping(1500);
            appendMsg("¡Es muy sencillo! 🎉");
            await showTyping(2000);
            appendMsg("Tienes varias rutas dependiendo de tu objetivo principal:");
            await showTyping(2500);
            appendMsg("- <strong>Para Trading:</strong> Puedes iniciar copiando sus operaciones en BingX o unirte a su grupo cerrado Bull Traders.", 'bot', true);
            await showTyping(2500);
            appendMsg("- <strong>Para Negocios:</strong> Puedes agendar una auditoría para escalar tus ventas o estructurar tu embudo automatizado.", 'bot', true);
            await showTyping(2000);
            appendMsg("¿Quieres que te transfiera a su número personal de WhatsApp para dar el primer paso?");
        }
        
        const wppText = `Hola Edwin, estuve interactuando con Nexus (Tu Agente IA). Me gustaría hablar contigo sobre: ${faqVal === 'quien' ? 'tu experiencia' : faqVal === 'roi' ? 'casos de éxito y ROI' : 'cómo empezar'}.`;
        const wppUrl = `https://wa.me/573183002448?text=${encodeURIComponent(wppText)}`;
        
        await showTyping(1500);
        appendMsg(`👇 Toca este botón para continuar el chat en WhatsApp:<br><br><a href="${wppUrl}" target="_blank" class="btn btn--primary" style="display:block; text-align:center; text-decoration:none; width:100%; padding: 10px; font-size:14px; margin-top:10px;">Continuar en WhatsApp ↗</a>`, 'bot', true);
    };

// Logic replaced by handleFAQSelect
});
