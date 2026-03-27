// web3-connect.js

document.addEventListener('DOMContentLoaded', () => {
    initWeb3Connect();
    initLanguageSwitcher();
    initDynamicContent();
});

// ==========================================
// 1. WEB3 WALLET CONNECT
// ==========================================
function initWeb3Connect() {
    const connectBtns = document.querySelectorAll('.web3-connect-btn');
    if (!connectBtns.length) return;

    // Check if already connected in this session
    const savedAddress = sessionStorage.getItem('web3_wallet_address');
    if (savedAddress) {
        updateButtons(savedAddress);
    }

    connectBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (typeof window.ethereum !== 'undefined') {
                try {
                    btn.innerHTML = '<span class="spinner"></span> Conectando...';
                    // Request account access
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const account = accounts[0];
                    
                    // Save to session to persist across pages
                    sessionStorage.setItem('web3_wallet_address', account);
                    updateButtons(account);
                    
                    showTechNotification(`Wallet Conectada: ${formatAddress(account)}`);
                    
                } catch (error) {
                    console.error("User denied account access or error:", error);
                    btn.innerHTML = '<i data-lucide="wallet"></i> Conectar Wallet';
                    if(window.lucide) lucide.createIcons();
                }
            } else {
                // If no ethereum provider is injected
                showTechNotification('No Web3 provider detected. Instala MetaMask.');
            }
        });
    });
    
    // Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', function (accounts) {
            if (accounts.length > 0) {
                sessionStorage.setItem('web3_wallet_address', accounts[0]);
                updateButtons(accounts[0]);
            } else {
                sessionStorage.removeItem('web3_wallet_address');
                resetButtons();
            }
        });
    }

    function updateButtons(address) {
        connectBtns.forEach(btn => {
            btn.innerHTML = `<i data-lucide="link"></i> ${formatAddress(address)}`;
            btn.classList.add('connected');
            btn.style.color = 'var(--cyan)';
            btn.style.borderColor = 'var(--cyan)';
        });
        if(window.lucide) lucide.createIcons();
    }
    
    function resetButtons() {
        connectBtns.forEach(btn => {
            btn.innerHTML = `<i data-lucide="wallet"></i> Conectar Wallet`;
            btn.classList.remove('connected');
            btn.style.color = '';
            btn.style.borderColor = '';
        });
        if(window.lucide) lucide.createIcons();
    }

    function formatAddress(address) {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
}

// ==========================================
// 2. NATIVE LANGUAGE SWITCHER (EN/ES)
// ==========================================
function initLanguageSwitcher() {
    if(!document.getElementById('googleTranslateScript')) {
        const gtScript = document.createElement('script');
        gtScript.id = 'googleTranslateScript';
        gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(gtScript);
        
        window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({
                pageLanguage: 'es', 
                includedLanguages: 'en,es',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
            }, 'google_translate_element');
        };
        
        const gtDiv = document.createElement('div');
        gtDiv.id = 'google_translate_element';
        gtDiv.style.display = 'none';
        document.body.appendChild(gtDiv);
        
        const style = document.createElement('style');
        style.innerHTML = `
            .goog-te-banner-frame.skiptranslate,
            #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
            body { top: 0px !important; }
            .goog-tooltip { display: none !important; }
            .goog-tooltip:hover { display: none !important; }
            .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
            font { background: transparent !important; color: inherit !important; }
        `;
        document.head.appendChild(style);
    }

    const langBtns = document.querySelectorAll('.lang-btn');
    if(!langBtns.length) return;

    let currentLang = localStorage.getItem('user_lang') || 'es';
    updateLangUI(currentLang);
    
    // Si hay un lenguaje guardado y no es el por defecto (es), forzar la traducción inicial
    if (currentLang !== 'es') {
        setTimeout(() => setLanguage(currentLang, 10), 1000); // 10 reintentos máx
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetLang = e.currentTarget.getAttribute('data-lang');
            if(targetLang !== currentLang) {
                currentLang = targetLang;
                localStorage.setItem('user_lang', targetLang);
                updateLangUI(targetLang);
                setLanguage(targetLang, 10);
            }
        });
    });

    function setLanguage(lang, retries) {
        if (retries <= 0) {
            console.warn("Google Translate initialization timed out.");
            return;
        }
        
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = lang;
            select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        } else {
            setTimeout(() => setLanguage(lang, retries - 1), 500);
        }
    }

    function updateLangUI(activeLang) {
        langBtns.forEach(btn => {
            if(btn.getAttribute('data-lang') === activeLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// Notification Helper
function showTechNotification(msg) {
    let notif = document.getElementById('techNotif');
    if(!notif) {
        notif = document.createElement('div');
        notif.id = 'techNotif';
        notif.style.position = 'fixed';
        notif.style.bottom = window.innerWidth <= 768 ? '120px' : '20px';
        notif.style.left = window.innerWidth <= 768 ? '15px' : '20px';
        notif.style.background = 'rgba(11, 15, 26, 0.9)';
        notif.style.backdropFilter = 'blur(10px)';
        notif.style.border = '1px solid var(--cyan)';
        notif.style.color = 'var(--cyan)';
        notif.style.padding = '12px 20px';
        notif.style.borderRadius = '8px';
        notif.style.fontFamily = 'var(--f-mono)';
        notif.style.fontSize = '0.85rem';
        notif.style.zIndex = '999999';
        notif.style.transform = 'translateY(100px)';
        notif.style.opacity = '0';
        notif.style.transition = '0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        document.body.appendChild(notif);
    }
    notif.innerHTML = msg;
    
    // Animar entrada
    setTimeout(() => {
        notif.style.transform = 'translateY(0)';
        notif.style.opacity = '1';
    }, 10);
    
    // Animar salida
    setTimeout(() => {
        notif.style.transform = 'translateY(100px)';
        notif.style.opacity = '0';
    }, 4000);
}

// ==========================================
// 3. DYNAMIC CONTENT (BLOG HERO & MEDIA)
// ==========================================
async function initDynamicContent() {
    if(!window.db) return; // Requires Firebase
    
    // Check current page securely (removing Query Params and Hashes)
    let rawPath = window.location.pathname.split('/').pop();
    let path = rawPath.split('?')[0].split('#')[0].replace('.html', '');
    if(!path || path === '') path = 'index';
    
    try {
        // 1. Fetch Blog Hero
        const heroDoc = await window.db.collection("settings").doc("blog_hero").get();
        if(heroDoc.exists) {
            const data = heroDoc.data();
            if(data.active && data.pages && data.pages.includes(path)) {
                // ... (Blog Hero)
                const heroBanner = document.createElement('div');
                heroBanner.style.background = 'linear-gradient(90deg, rgba(88,101,242,0.1), rgba(0,212,255,0.1))';
                heroBanner.style.borderBottom = '1px solid var(--b-1)';
                heroBanner.style.padding = '12px 20px';
                heroBanner.style.textAlign = 'center';
                heroBanner.style.display = 'flex';
                heroBanner.style.flexWrap = 'wrap';
                heroBanner.style.alignItems = 'center';
                heroBanner.style.justifyContent = 'center';
                heroBanner.style.gap = '15px';
                heroBanner.style.position = 'relative';
                heroBanner.style.zIndex = '1000';
                
                let titleHtml = `<span class="mono" style="color:var(--cyan); font-weight:bold; font-size:0.85rem; padding: 3px 8px; border: 1px solid var(--cyan); border-radius: 4px;">${data.title}</span>`;
                let textHtml = `<span style="color:var(--t-1); font-size:0.9rem;">${data.text}</span>`;
                let btnHtml = data.link ? `<a href="${data.link}" target="_blank" class="btn btn--outline" style="padding: 5px 15px; font-size: 0.8rem;">${data.btnText || 'Ver más'}</a>` : '';
                
                heroBanner.innerHTML = `${titleHtml} ${textHtml} ${btnHtml}`;
                document.body.insertBefore(heroBanner, document.body.firstChild);
            }
        }
        
        // 2. Fetch Media Config for Diplomado and Marketing
        if(path === 'diplomado' || path === 'marketing') {
            const mediaDoc = await window.db.collection("settings").doc("page_media").get();
            if(mediaDoc.exists) {
                const data = mediaDoc.data();
                
                // Diplomado specific
                if(path === 'diplomado') {
                    if (data.diplomadoVideo && data.diplomadoVideo.trim() !== '') {
                        const videoContainer = document.getElementById('diplomado-video-container');
                        const videoPlaceholder = document.getElementById('diplomado-video-placeholder');
                        if(videoContainer) {
                            if(videoPlaceholder) videoPlaceholder.style.display = 'none';
                            videoContainer.innerHTML = createVideoHtml(data.diplomadoVideo, data.diplomadoPoster);
                            videoContainer.style.display = 'block';
                            if(window.lucide) window.lucide.createIcons();
                        }
                    } else {
                        console.warn('Diplomado: settings guardados, pero el link del video de Diplomado está vacío en Firebase.');
                        showTechNotification('Error: El panel guarda el documento pero recibo un link vacío de Video.');
                    }
                }
                
                // Marketing specific
                if(path === 'marketing' && data.marketingVideo && data.marketingVideo.trim() !== '') {
                    const videoContainer = document.getElementById('marketing-video-container');
                    if(videoContainer) {
                        videoContainer.innerHTML = createVideoHtml(data.marketingVideo, data.marketingPoster);
                        videoContainer.style.display = 'block';
                        if(window.lucide) window.lucide.createIcons();
                    }
                }
            } else {
                 console.warn('No existe la configuración page_media en settings.');
                 showTechNotification('No hay configuración de page_media guardada en Firebase.');
            }
        }
    } catch(e) {
        console.error("Error cargando contenido dinámico:", e);
        showTechNotification('Error Firestore: ' + e.message);
    }
}

function createVideoHtml(videoUrl, posterUrl) {
    if(videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const cleanUrl = videoUrl.trim();
        let videoId = '';
        if(cleanUrl.includes('v=')) videoId = cleanUrl.split('v=')[1].split('&')[0];
        else videoId = cleanUrl.split('/').pop().split('?')[0];
        videoId = videoId.trim();
        
        // Return native clean YouTube iframe
        return `
        <div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:12px; overflow:hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?rel=0" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:12px;"></iframe>
        </div>`;
    } else {
        const posterAttr = posterUrl ? `poster="${posterUrl}"` : '';
        return `<video ${posterAttr} autoplay muted loop playsinline controls style="width:100%; border-radius:12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);"><source src="${videoUrl}" type="video/mp4">Tu navegador no soporta videos.</video>`;
    }
}
