'use strict';
/* ════════════════════════════════════════════════════
   EDWIN MUÑOZ ISAZA — PORTFOLIO SCRIPT v2
   Works with: index.html, desarrollo.html, cripto.html, negocios.html
   ════════════════════════════════════════════════════ */

// ─── LOADER ───────────────────────────────────────────────
(function initLoader() {
  const loader = document.getElementById('loader');
  const progress = document.getElementById('loaderProgress');
  const status = document.getElementById('loaderStatus');
  if (!loader) return;

  const msgs = ['Inicializando sistema...', 'Cargando módulos...', 'Listo.'];
  let pct = 0;
  let msgIdx = 0;

  const tick = setInterval(() => {
    pct += Math.random() * 22 + 8;
    if (pct >= 100) { 
      pct = 100; 
      clearInterval(tick); 
      setTimeout(() => {
        loader.classList.add('out');
        document.body.style.overflow = '';
      }, 400);
    }
    if (progress) progress.style.width = pct + '%';
    if (status && msgIdx < msgs.length && pct > msgIdx * 40 + 20) {
      status.textContent = msgs[msgIdx++];
    }
  }, 120);

  document.body.style.overflow = 'hidden';
})();

// ─── CUSTOM CURSOR ────────────────────────────────────────
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower || window.matchMedia('(pointer:coarse)').matches) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate(${mx}px,${my}px)`;

    // Ambient Light with heavy inertia
    const ambient = document.getElementById('ambientLight');
    if (ambient) {
      ambient.style.transform = `translate(${mx}px, ${my}px)`;
    }
  });


  (function moveFoll() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.transform = `translate(${fx}px,${fy}px)`;
    requestAnimationFrame(moveFoll);
  })();

  document.querySelectorAll('a, button, .svc-card, .strat-card, .eco-card, .magnetic, .gt-node, .stab').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); follower.classList.add('hovering'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); follower.classList.remove('hovering'); });
  });

  document.addEventListener('mousedown', () => { cursor.style.transform += ' scale(0.7)'; });
  document.addEventListener('mouseup', () => { cursor.style.transform = cursor.style.transform.replace(' scale(0.7)', ''); });

  // --- MAGNETIC BUTTONS LOGIC ---
  const magneticWraps = document.querySelectorAll('.magnetic-wrap');
  if (magneticWraps.length) {
    magneticWraps.forEach(wrap => {
      const btn = wrap.querySelector('.magnetic');
      if (!btn) return;

      wrap.addEventListener('mousemove', e => {
        const rect = wrap.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Move the button towards the mouse (magnetic effect)
        btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
        wrap.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      wrap.addEventListener('mouseleave', () => {
        // Reset positions
        btn.style.transform = `translate(0, 0)`;
        wrap.style.transform = `translate(0, 0)`;
      });
    });
  }
})();


// ─── NAV SCROLL ───────────────────────────────────────────
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

// ─── MOBILE BURGER MENU (SECTION LINKS) ───────────────────
(function initBurger() {
  const burger = document.getElementById('navBurger');
  const mobMenu = document.getElementById('mobMenu');
  if (!burger || !mobMenu) return;

  function closeMenu() {
    mobMenu.classList.remove('open');
    burger.classList.remove('active');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    const open = mobMenu.classList.toggle('open');
    burger.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  const mobClose = document.createElement('button');
  mobClose.className = 'mob-close';
  mobClose.innerHTML = '&times;';
  mobClose.setAttribute('aria-label', 'Cerrar menú');
  mobMenu.appendChild(mobClose);

  mobClose.addEventListener('click', closeMenu);

  mobMenu.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // If it's an internal hash link, handle it with smooth scroll
      if (href && href.includes('#')) {
        const hash = href.substring(href.indexOf('#'));
        const target = document.querySelector(hash);
        if (target) {
            e.preventDefault();
            closeMenu();
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
            return;
        }
      }
      closeMenu();
    });
  });
})();

// ─── SCROLL REVEAL ────────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll('.sr');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

// ─── COUNTER ANIMATION ────────────────────────────────────
(function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  function animCount(el, target) {
    let start = null;
    const dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      el.textContent = Math.floor(ease * target);
      if (prog < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animCount(e.target, parseInt(e.target.dataset.count, 10));
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach(el => obs.observe(el));
})();

// ─── TYPEWRITER ───────────────────────────────────────────
function initTypewriter(roles) {
  const el = document.getElementById('typewriter');
  if (!el || !roles || !roles.length) return;
  let ri = 0, ci = 0, deleting = false;
  const speed = { type: 75, del: 40, pause: 1800, pauseDel: 500 };

  function tick() {
    const word = roles[ri];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, speed.pause); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; setTimeout(tick, speed.pauseDel); return; }
    }
    setTimeout(tick, deleting ? speed.del : speed.type);
  }
  setTimeout(tick, 400);
}

// ─── PARTICLE CANVAS ──────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts;

  function resize() {
    if (W === window.innerWidth && H === window.innerHeight) return;
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    if (pts) init();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function mkPt() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.4 + 0.1
    };

  }

  function init() {
    const n = Math.min(Math.floor((W * H) / 16000), 80);
    pts = Array.from({ length: n }, mkPt);
  }
  init();

  function drawLine(a, b, dist, maxDist) {
    const alpha = (1 - dist / maxDist) * 0.18;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(40,120,255,${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    const maxDist = 140;
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(40,150,255,${p.a})`;
      ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < maxDist) drawLine(pts[i], pts[j], d, maxDist);
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

// ─── STACK TABS (desarrollo.html) ─────────────────────────
(function initTabs() {
  const tabs = document.querySelectorAll('.stab');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.stack-panel').forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });
      const panel = document.getElementById('tab-' + tab.dataset.tab);
      if (panel) { panel.classList.add('active'); panel.hidden = false; }
    });
  });
})();

// ─── I18N (INTERNATIONALIZATION) ──────────────────────────
const i18n = {
  lang: localStorage.getItem('edwin-lang') || 'es',
  data: {},
  async init() {
    try {
      const res = await fetch('/data_v2/translations.json');
      this.data = await res.json();
      this.updateUI();
    } catch (err) {
      console.warn('i18n error:', err);
    } finally {
      this.initButtons();
    }
  },
  updateUI() {
    const texts = this.data[this.lang];
    if (!texts) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (texts[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = texts[key];
        } else {
          el.textContent = texts[key];
        }
      }
    });
    document.documentElement.lang = this.lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.lang);
    });
  },
  setLang(l) {
    this.lang = l;
    localStorage.setItem('edwin-lang', l);
    this.updateUI();
  },
  initButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setLang(btn.dataset.lang));
    });
  }
};
i18n.init();

// ─── CONTACT FORM & AI AGENT ──────────────────────────────
(function initForm() {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('f-submit');
  const formOk = document.getElementById('formOk');

  // Webhook URL (Fill with Make.com/n8n URL)
  const WEBHOOK_URL = '';

  if (!form) return;

  // Create Processing Overlay if not exists
  let overlay = form.querySelector('.form-processing');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'form-processing';
    overlay.innerHTML = `
      <div class="ai-pulse"></div>
      <div class="ai-status" data-i18n="ai_processing">AGENTE IA ANALIZANDO SOLICITUD...</div>
    `;
    form.classList.add('pos-rel'); // Ensure relative positioning
    form.appendChild(overlay);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Show AI Processing
    overlay.classList.add('active');
    if (btn) btn.disabled = true;

    try {
      // Simulate/Send to Webhook
      if (WEBHOOK_URL) {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, lang: i18n.lang, timestamp: new Date().toISOString() })
        });
      }

      // Small delay to "feel" the AI analyzing
      await new Promise(r => setTimeout(r, 2000));

      overlay.classList.remove('active');
      if (formOk) formOk.classList.add('show');
      form.reset();

      setTimeout(() => {
        if (btn) { btn.disabled = false; btn.textContent = i18n.data[i18n.lang]?.hero_cta_2 || 'Enviar mensaje →'; }
        if (formOk) formOk.classList.remove('show');
      }, 5000);

    } catch (err) {
      console.error('Form error:', err);
      overlay.classList.remove('active');
      alert('Error enviando mensaje. Intenta por WhatsApp.');
      if (btn) btn.disabled = false;
    }
  });
})();

// ─── SMOOTH SCROLL for # LINKS ────────────────────────────
// Handles all internal links globally
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── EFECTOS VISUALES TEMÁTICOS ──────────────────────────
(function initThematicEffects() {
  const codeLayer = document.getElementById('codeEffectLayer');
  const coinsLayer = document.getElementById('coinsEffectLayer');
  const flashLayer = document.getElementById('flashEffectLayer');

  // Código Cayendo (Desarrollo)
  if (codeLayer) {
    const codes = ['01', 'solidity', 'web3', '0x21F', 'uint256', 'mapping', 'emit', 'pure', 'DApp'];
    setInterval(() => {
      const el = document.createElement('div');
      el.className = 'code-drop';
      el.textContent = codes[Math.floor(Math.random() * codes.length)];
      el.style.left = Math.random() * 100 + '%';
      el.style.animationDuration = (Math.random() * 3 + 2) + 's';
      codeLayer.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }, 400);
  }

  // Monedas (Cripto)
  if (coinsLayer) {
    const coins = ['💎', '₿', 'Ξ', '💵', '🪙'];
    setInterval(() => {
      const el = document.createElement('div');
      el.className = 'coin-particle';
      el.textContent = coins[Math.floor(Math.random() * coins.length)];
      el.style.left = Math.random() * 100 + '%';
      el.style.animationDuration = (Math.random() * 4 + 3) + 's';
      coinsLayer.appendChild(el);
      setTimeout(() => el.remove(), 7000);
    }, 800);
  }

  // Flash (Fotografía / Negocios)
  if (flashLayer) {
    const flash = document.createElement('div');
    flash.className = 'flash-white';
    flashLayer.appendChild(flash);

    // Trigger flash every 6-10 seconds
    const triggerFlash = () => {
      flash.classList.add('flash-active');
      setTimeout(() => flash.classList.remove('flash-active'), 500);
      setTimeout(triggerFlash, Math.random() * 4000 + 6000);
    };

    setTimeout(triggerFlash, 3000);
  }
})();

// ─── CARGADOR DE PORTAFOLIO DINÁMICO ───────────────────────
async function initDynamicPortfolio() {
  const grids = document.querySelectorAll('.works-grid');
  if (!grids.length) return;

  try {
    const response = await fetch('data_v2/works.json');
    const data = await response.json();
    const works = data.works;

    grids.forEach(grid => {
      const category = grid.dataset.category || 'all';
      let filteredWorks = works;

      if (category !== 'all') {
        const allowed = category.split(',').map(c => c.trim().toLowerCase());
        filteredWorks = works.filter(w => w.category && allowed.some(c => w.category.toLowerCase().includes(c)));
      }

      grid.innerHTML = filteredWorks.map(w => `
        <article class="work-card sr">
          <img src="${w.image}" alt="${w.title}" class="work-card__img" onerror="this.src='https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop'">
          <div class="work-card__content">
            <div class="work-card__cat">${w.category}</div>
            <h3 class="work-card__title">${w.title}</h3>
            <p class="work-card__desc">${w.description}</p>
            <div class="work-card__tags">
              ${w.tags.map(t => `<span class="work-card__tag">${t}</span>`).join('')}
            </div>
            <a href="${w.link}" target="_blank" class="btn btn--outline btn--sm" style="margin-top:20px">Ver detalles</a>
          </div>
        </article>
      `).join('');
    });

    // Re-initialize Scroll Reveal for new elements
    const newEls = document.querySelectorAll('.work-card.sr');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    newEls.forEach(el => obs.observe(el));

  } catch (err) {
    console.warn('Error cargando portafolio dinámico:', err);
  }
}
initDynamicPortfolio();


// ─── LIVE CRYPTO PRICES (CoinGecko) ───────────────────────
async function initLivePrices() {
  const ids = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'cardano', 'polygon', 'chainlink'];
  const mapping = {
    'bitcoin': 'btc',
    'ethereum': 'eth',
    'solana': 'sol',
    'binancecoin': 'bnb',
    'cardano': 'ada',
    'polygon': 'matic',
    'chainlink': 'link'
  };


  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`);
    const data = await res.json();

    Object.keys(data).forEach(id => {
      const sym = mapping[id];
      const price = data[id].usd;
      const change = data[id].usd_24h_change;
      const isUp = change >= 0;
      const symbol = isUp ? '▲' : '▼';
      const colorClass = isUp ? 't-up' : 't-dn';
      const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
      const formattedChange = Math.abs(change).toFixed(1) + '%';

      // Update Ticker
      const tickerEls = document.querySelectorAll(`#tick-${sym}, #tick-${sym}-2`);
      tickerEls.forEach(el => {
        const priceEl = el.querySelector('.t-price');
        const changeEl = el.querySelector('.t-up, .t-dn');
        if (priceEl) priceEl.textContent = formattedPrice;
        if (changeEl) {
          changeEl.textContent = `${symbol}${isUp ? '+' : '-'}${formattedChange}`;
          changeEl.className = colorClass;
        }
      });

      // Update Hero Badges
      const badgeEl = document.getElementById(`badge-${sym}`);
      if (badgeEl) {
        const span = badgeEl.querySelector('span.mono');
        if (span) span.textContent = `${sym.toUpperCase()} ${symbol}${isUp ? '+' : '-'}${formattedChange}`;
      }
    });
  } catch (err) {
    console.warn('CoinGecko API error:', err);
  }
}
initLivePrices();
// Update every 2 minutes
setInterval(initLivePrices, 120000);

console.log('%c⚡ Edwin Muñoz Isaza — Tech & Web3 Architect', 'color:#06b6d4;font-size:14px;font-weight:bold;');
console.log('%c"No solo usamos IA… la convertimos en ingresos."', 'color:#8892aa;font-size:11px;');
// FAQ Accordion
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.plus').textContent = '+';
      });

      // Open clicked
      if (!isActive) {
        item.classList.add('active');
        trigger.querySelector('.plus').textContent = '−';
      }
    });
  });



  const initCriptoCalc = () => {
    const range = document.getElementById('cripto-capital-range');
    const capitalVal = document.getElementById('cripto-capital-val');
    const monthlyVal = document.getElementById('cripto-monthly-val');
    const yearlyVal = document.getElementById('cripto-yearly-val');

    if (!range) return;

    const update = () => {
      const capital = parseInt(range.value);
      const monthlyROI = 0.20;
      const monthlyIncome = capital * monthlyROI;

      // Compound interest for 12 months: A = P(1 + r)^n
      const yearlyAcum = capital * Math.pow(1 + monthlyROI, 12);

      capitalVal.textContent = `$${capital.toLocaleString()}`;
      monthlyVal.textContent = `$${Math.round(monthlyIncome).toLocaleString()}`;
      yearlyVal.textContent = `$${Math.round(yearlyAcum).toLocaleString()}`;
    };


    range.addEventListener('input', update);
    update();
  };


  const initLiveSocialProof = () => {
    const events = [
      { title: "Nuevo Alumno", desc: "Juan S. se inscribió al Diplomado IA", icon: "user-plus" },
      { title: "Estrategia Activa", desc: "Yield Architecture operando a +18.4% ROI", icon: "trending-up" },
      { title: "Nueva Consulta", desc: "Empresa tech solicitó auditoría de sistemas", icon: "briefcase" },
      { title: "Comunidad Alpha", desc: "5 nuevos inversionistas se unieron hoy", icon: "users" },
      { title: "Cripto BOT", desc: "Liquidación evitada por algoritmo de riesgo", icon: "shield-check" },
      { title: "Diplomado IA", desc: "¡Quedan solo 8 becas disponibles para 2026!", icon: "alert-triangle" }
    ];

    const container = document.createElement('div');
    container.className = 'social-proof-toast';
    container.id = 'spToast';
    container.innerHTML = `
      <div class="sp-icon"><i data-lucide="user-plus"></i></div>
      <div class="sp-content">
        <span class="sp-title"></span>
        <span class="sp-desc"></span>
      </div>
    `;
    document.body.appendChild(container);

    let idx = 0;
    const showNext = () => {
      // Nexus UI Logic: Don't show social proof if a major panel is open
      const hasActivePanel = document.querySelector('#aiChat.active, #waChat.active, #edwinTerminal.active, #cryptoLiveWidget.active');
      if (hasActivePanel) {
        setTimeout(showNext, 5000); // Retry soon
        return;
      }

      const ev = events[idx];
      container.querySelector('.sp-title').textContent = ev.title;
      container.querySelector('.sp-desc').textContent = ev.desc;
      const iconWrap = container.querySelector('.sp-icon');
      iconWrap.innerHTML = `<i data-lucide="${ev.icon}"></i>`;
      if (window.lucide) window.lucide.createIcons();

      container.classList.add('active');

      setTimeout(() => {
        container.classList.remove('active');
        idx = (idx + 1) % events.length;
        // Schedule next with random delay
        setTimeout(showNext, Math.random() * 15000 + 20000);
      }, 5000);
    };


    // Initial delay
    setTimeout(showNext, 8000);
  };


  // initWhatsAppBot removed to leave Nexus AI as the sole assistant.
  initCriptoCalc();
  initLiveSocialProof();
  initTerminalWidget();
});


// ─── PAGE TRANSITIONS (View Transitions API) ──────────────
(function initPageTransitions() {
  if (!document.startViewTransition) return; // graceful fallback

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const url = link.href;
    const isInternal = url && url.startsWith(location.origin) && !url.includes('#') && !link.target;
    if (!isInternal) return;

    e.preventDefault();
    document.startViewTransition(() => {
      window.location.href = url;
    });
  });
})();

// ─── LIVE CRYPTO WIDGET (floating panel) ──────────────────
(function initCryptoWidget() {
  // Only show on index.html and cripto.html
  const onHomePage = document.body.dataset.theme === 'home';
  const onCriptoPage = document.body.dataset.theme === 'cripto';
  if (!onHomePage && !onCriptoPage) return;

  // Build widget markup
  const widget = document.createElement('div');
  widget.id = 'cryptoLiveWidget';
  widget.innerHTML = `
    <div class="clw-header">
      <span class="clw-dot"></span>
      <span class="mono clw-label">LIVE PRICES</span>
      <button class="clw-toggle" id="clwToggle" aria-label="Minimizar">−</button>
    </div>
    <div class="clw-body" id="clwBody">
      <div class="clw-row" id="clw-btc">
        <span class="clw-sym mono">BTC</span>
        <span class="clw-price" id="clw-price-btc">—</span>
        <span class="clw-chg" id="clw-chg-btc">—</span>
      </div>
      <div class="clw-row" id="clw-eth">
        <span class="clw-sym mono">ETH</span>
        <span class="clw-price" id="clw-price-eth">—</span>
        <span class="clw-chg" id="clw-chg-eth">—</span>
      </div>
      <div class="clw-row" id="clw-sol">
        <span class="clw-sym mono">SOL</span>
        <span class="clw-price" id="clw-price-sol">—</span>
        <span class="clw-chg" id="clw-chg-sol">—</span>
      </div>
      ${onCriptoPage ? `
      <div class="clw-row" id="clw-bnb">
        <span class="clw-sym mono">BNB</span>
        <span class="clw-price" id="clw-price-bnb">—</span>
        <span class="clw-chg" id="clw-chg-bnb">—</span>
      </div>
      <div class="clw-row" id="clw-link">
        <span class="clw-sym mono">LINK</span>
        <span class="clw-price" id="clw-price-link">—</span>
        <span class="clw-chg" id="clw-chg-link">—</span>
      </div>` : ''}
    </div>
    <div class="clw-footer mono">via CoinGecko • actualiza c/2m</div>
  `;
  document.body.appendChild(widget);

  // Toggle minimize
  const toggle = document.getElementById('clwToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isActive = widget.classList.toggle('active');
      toggle.textContent = isActive ? '−' : '+';
      if (isActive) {
        // Logic for Nexus UI: Close others if we expand prices
        if (typeof window.closeAllHubPanels === 'function') {
           window.closeAllHubPanels();
        }
      }
    });

    // Default state: closed/minimized on mobile, open on desktop
    if (window.innerWidth < 900) {
      widget.classList.remove('active');
      toggle.textContent = '+';
    } else {
      widget.classList.add('active');
      toggle.textContent = '−';
    }
  }

  // Fetch and update prices
  const coinMap = { bitcoin: 'btc', ethereum: 'eth', solana: 'sol', binancecoin: 'bnb', chainlink: 'link' };
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

  async function fetchPrices() {
    try {
      const ids = Object.keys(coinMap).join(',');
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
      const data = await res.json();
      Object.entries(data).forEach(([id, vals]) => {
        const sym = coinMap[id];
        const priceEl = document.getElementById(`clw-price-${sym}`);
        const chgEl = document.getElementById(`clw-chg-${sym}`);
        if (!priceEl) return;
        const up = vals.usd_24h_change >= 0;
        priceEl.textContent = fmt.format(vals.usd);
        chgEl.textContent = `${up ? '▲' : '▼'} ${Math.abs(vals.usd_24h_change).toFixed(2)}%`;
        chgEl.className = `clw-chg ${up ? 'clw-up' : 'clw-dn'}`;
      });
    } catch (e) {
      console.warn('Crypto widget error:', e);
    }
  }

  fetchPrices();
  setInterval(fetchPrices, 120000);
})();

// ─── KONAMI CODE EASTER EGG — MATRIX RAIN 🎮 ──────────────
(function initKonamiCode() {
  const SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let idx = 0;

  document.addEventListener('keydown', e => {
    if (e.key === SEQUENCE[idx]) {
      idx++;
      if (idx === SEQUENCE.length) {
        idx = 0;
        activateMatrixMode();
      }
    } else {
      idx = e.key === SEQUENCE[0] ? 1 : 0;
    }
  });

  function activateMatrixMode() {
    // If already active, deactivate
    const existing = document.getElementById('matrixOverlay');
    if (existing) { existing.remove(); return; }

    // Toast notification
    const toast = document.createElement('div');
    toast.className = 'matrix-toast';
    toast.innerHTML = `<span class="mono">// MODO HACKER ACTIVADO 🎮</span><br><span style="font-size:0.75rem;opacity:0.7;">Presiona cualquier tecla para salir.</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);

    // Create overlay canvas
    const overlay = document.createElement('div');
    overlay.id = 'matrixOverlay';

    const canvas = document.createElement('canvas');
    canvas.id = 'matrixCanvas';
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    // Matrix rain animation
    const ctx = canvas.getContext('2d');
    let W, H, cols, drops;
    const chars = '01アイウエオカキクケコアSolidity0xETHBTCDeFiウェブ3ABCDEFfunctionmappinguint256'.split('');

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cols = Math.floor(W / 16);
      if (!drops) drops = Array(cols).fill(0).map(() => Math.random() * -H / 16);
    }
    resize();
    window.addEventListener('resize', resize);

    let raf;
    function draw() {
      ctx.fillStyle = 'rgba(0, 8, 0, 0.07)';
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < cols; i++) {
        ctx.fillStyle = i % 10 === 0 ? '#fff' : i % 3 === 0 ? '#00d4ff' : '#00ff87';
        ctx.font = '14px "Share Tech Mono", monospace';
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 16, drops[i] * 16);
        if (drops[i] * 16 > H && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.8;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    // Dismiss on any key press
    const dismiss = (e) => {
      if (e.key === 'Escape' || e.type === 'click') {
        cancelAnimationFrame(raf);
        overlay.remove();
        window.removeEventListener('resize', resize);
        document.removeEventListener('keydown', dismiss);
        overlay.removeEventListener('click', dismiss);
      }
    };

    setTimeout(() => {
      document.addEventListener('keydown', dismiss);
      overlay.addEventListener('click', dismiss);
    }, 500);
  }
})();

// Terminal Widget — runs globally if #terminalOutput exists
function initTerminalWidget() {
  const output = document.getElementById('terminalOutput');
  if (!output) return;

  const lines = [
    { cls: 't-info', text: '> Inicializando EM_OS v3.0...' },
    { cls: 't-success', text: '✓ Módulos Web3 cargados: 12/12' },
    { cls: 't-success', text: '✓ Conexión DeFi: BingX, Uniswap v3' },
    { cls: 't-warning', text: '⚡ Smart contract auditado: 0 vulnerabilidades' },
    { cls: 't-info', text: '> Escaneando oportunidades de yield...' },
    { cls: 't-success', text: '✓ ROI proyectado: +18.4% mensual' },
    { cls: 't-info', text: '> Compilando estrategia de conversión...' },
    { cls: 't-success', text: '✓ Campaign ROAS: 4.2x' },
    { cls: 't-warning', text: '⚡ IA pipeline activo: GPT-4 + Claude 3' },
    { cls: 't-info', text: '> Todos los sistemas operativos.' },
    { cls: '', text: '█' },
  ];

  let i = 0;
  const addLine = () => {
    if (i >= lines.length) { i = 0; output.innerHTML = ''; }
    const span = document.createElement('span');
    span.className = `t-line ${lines[i].cls}`;
    span.textContent = lines[i].text;
    output.appendChild(span);
    // Auto-scroll
    output.scrollTop = output.scrollHeight;
    i++;
    if (i < lines.length) setTimeout(addLine, Math.random() * 600 + 300);
    else setTimeout(() => { output.innerHTML = ''; i = 0; addLine(); }, 3000);
  };


  setTimeout(addLine, 1000);
}

// ─── EDWIN-OS TERMINAL (PHASE 2) ─────────────────────────
// ─── CYBERPUNK SOUND ENGINE (PHASE 2) ────────────────────
const SoundEngine = (function () {
  const AudioCtxVal = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  let enabled = false;

  const playTone = (freq, type, duration, vol) => {
    if (!enabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) { }
  };


  return {
    enable: () => {
      enabled = true;
      if (!audioCtx) audioCtx = new AudioCtxVal();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    },
    disable: () => { enabled = false; },
    click: () => playTone(800, 'sine', 0.1, 0.1),
    hover: () => playTone(400, 'sine', 0.05, 0.05),
    error: () => playTone(150, 'sawtooth', 0.3, 0.1),
    success: () => {
      playTone(600, 'sine', 0.1, 0.1);
      setTimeout(() => playTone(900, 'sine', 0.1, 0.1), 100);
    }
  };

})();

// Hook into interactions
document.addEventListener('mouseenter', e => {
  if (e.target.closest('a, button, .svc-card, #aiToggle, .module-trigger')) SoundEngine.hover();
}, true);

document.addEventListener('click', e => {
  if (e.target.closest('a, button, .svc-card, #aiToggle, .module-trigger')) SoundEngine.click();
}, true);

function initEdwinOS() {
  const isMobile = window.matchMedia('(pointer:coarse)').matches;

  // Terminal HTML Template
  const termHTML = `
    <div id="edwinTerminal">
      <div class="term-header">
        <span class="mono">EDWIN_OS v3.0 // SYSTEM_ROOT</span>
        <span class="mono">STATUS: OPTIMAL</span>
      </div>
      <div class="term-body" id="termBody">
        <div class="term-line t-info">> ARCH_BRIDGE_ESTABLISHED. BIENVENIDO A EDWIN_OS.</div>
        <div class="term-line t-info">> [TIP] Puedes interactuar haciendo clic en los botones inferiores o en los comandos resaltados en azul.</div>
      </div>
      <div class="term-input-wrap">
        <span class="term-prompt">edwin@arch:~#</span>
        <input type="text" id="termInput" spellcheck="false" autocomplete="off" autofocus>
      </div>
      <div class="term-quick-actions">
        <button class="term-qbtn" data-cmd="whoami">Perfil</button>
        <button class="term-qbtn" data-cmd="ls">Páginas</button>
        <button class="term-qbtn" data-cmd="web3">Web3</button>
        <button class="term-qbtn" data-cmd="crypto">Precios</button>
        <button class="term-qbtn" data-cmd="help">Ayuda</button>
      </div>
      <div class="term-hint mono">Pulsa ESC o 'exit' para salir | Haz clic en los comandos azulados</div>
    </div>
    <button id="termToggleBtn" title="Launch Edwin-OS Terminal">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
    </button>
  `;

  // Inject to DOM if not exists
  if (!document.getElementById('edwinTerminal')) {
    document.body.insertAdjacentHTML('beforeend', termHTML);
  }

  const term = document.getElementById('edwinTerminal');
  const input = document.getElementById('termInput');
  const body = document.getElementById('termBody');
  const toggleBtn = document.getElementById('termToggleBtn');

  const history = [];
  let historyIdx = -1;

  const logs = {
    help: () => `
      COMANDOS DISPONIBLES (Haz clic en uno):
      - <span class="term-link" data-cmd="whoami">whoami</span>    : Perfil profesional
      - <span class="term-link" data-cmd="ls">ls</span>        : Lista de secciones
      - <span class="term-link" data-cmd="web3">web3</span>      : Identidad Blockchain
      - <span class="term-link" data-cmd="crypto">crypto</span>    : Precios en vivo
      - <span class="term-link" data-cmd="status">status</span>    : Estado del sistema
      - <span class="term-link" data-cmd="clear">clear</span>     : Limpiar consola
      - <span class="term-link" data-cmd="exit">exit</span>      : Cerrar Edwin-OS
    `,
    whoami: () => `
      NAME: Edwin Muñoz Isaza
      ROLE: Tech & Web3 Architect
      EXP: 12+ años de experiencia (v3.0)
      FOCUS: System Design, AI Protocols, Blockchain Structures.
      MISSION: Transforming ideas into digital assets.
    `,
    ls: () => `
      /home/edwin/portfolio
      - home.html
      - web3_dev.html
      - crypto_strategies.html
      - performance_marketing.html
      - business_logic.html
      - ai_diplomado.html
    `,
    status: () => `
      OS: EM_OS v3.0 (Quantum Core)
      BRAIN: Claude-3.5-Intelligence-Linked
      UPTIME: 100.00%
      NETWORK: Web3 Mesh Enabled
      HACKER_MODE: ${document.getElementById('matrixOverlay') ? 'ACTIVE' : 'IDLE'}
    `,
    crypto: () => {
      const btc = document.querySelector('.symbol--btc')?.nextElementSibling?.textContent || '--';
      const eth = document.querySelector('.symbol--eth')?.nextElementSibling?.textContent || '--';
      return `[PRICE_FETCH] BTC: ${btc} | ETH: ${eth}`;
    },
    web3: () => {
      const isMetamask = typeof window.ethereum !== 'undefined';
      return `
      WEB3 IDENTITY PROTOCOLO:
      - PROVIDER: ${isMetamask ? 'METAMASK_DETECTED' : 'NOT_FOUND'}
      - STATUS: ${window.userAccount ? 'CONNECTED' : 'UNLINKED'}
      - ADDR: ${window.userAccount || '0x00...0000'}

      Type 'connect' to initialize handshake.
      `;
    }
  };


  const addLine = (text, type = 'res') => {
    const line = document.createElement('div');
    line.className = `term-line t-${type}`;
    line.innerHTML = text.replace(/\n/g, '<br>');
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  };


  const processCmd = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    addLine(`edwin@arch:~# ${cmd}`, 'cmd');
    history.push(cmd);
    historyIdx = history.length;

    if (cmd === 'clear') {
      body.innerHTML = '';
    } else if (cmd === 'exit' || cmd === 'close') {
      toggleTerm();
    } else if (cmd === 'help') {
      addLine(logs.help());
    } else if (cmd === 'whoami') {
      addLine(logs.whoami());
    } else if (cmd === 'ls' || cmd === 'dir') {
      addLine(logs.ls());
    } else if (cmd === 'status') {
      addLine(logs.status());
    } else if (cmd === 'web3') {
      addLine(logs.web3());
    } else if (cmd === 'connect') {
      if (typeof window.ethereum !== 'undefined') {
        addLine('Initializing Web3 Handshake...', 'info');
        window.ethereum.request({ method: 'eth_requestAccounts' })
          .then(accounts => {
            window.userAccount = accounts[0];
            addLine(`✓ Link Established: ${accounts[0]}`, 'success');
            document.body.classList.add('web3-verified');
            const statusEl = document.querySelector('.term-header span:last-child');
            if (statusEl) statusEl.textContent = 'STATUS: VERIFIED_IDENTITY';
          })
          .catch(err => addLine(`Error: ${err.message}`, 'err'));
      } else {
        addLine('Error: No Web3 Provider found. Please install MetaMask.', 'err');
      }
    } else if (cmd === 'crypto') {
      addLine(logs.crypto());
    } else if (cmd.startsWith('cd ')) {
      const target = cmd.split(' ')[1];
      const pages = {
        'home': 'index.html', 'index': 'index.html',
        'web3': 'desarrollo.html', 'dev': 'desarrollo.html',
        'crypto': 'cripto.html', 'cripto': 'cripto.html',
        'marketing': 'marketing.html',
        'negocios': 'negocios.html', 'business': 'negocios.html',
        'diplomado': 'diplomado.html', 'ia': 'diplomado.html'
      };

      if (pages[target]) {
        addLine(`Redirecting to ${target}...`, 'info');
        setTimeout(() => window.location.href = pages[target], 500);
      } else {
        addLine(`Error: target '${target}' not found. Usage: cd [target]`, 'err');
      }
    } else {
      addLine(`Command not found: ${cmd}. Type 'help' for options.`, 'err');
    }
  };


  const toggleTerm = () => {
    window.verifyIdentity(() => {
      term.classList.toggle('active');
      if (term.classList.contains('active')) {
        input.focus();
      }
    });
  };

  window.toggleTerm = toggleTerm;

  // Listeners
  toggleBtn.addEventListener('click', toggleTerm);

  // Quick Actions and Links
  term.addEventListener('click', (e) => {
    const btn = e.target.closest('.term-qbtn');
    const link = e.target.closest('.term-link');
    if (btn || link) {
      const cmd = (btn || link).getAttribute('data-cmd');
      processCmd(cmd);
      return;
    }
    input.focus();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      processCmd(input.value);
      input.value = '';
    }
    if (e.key === 'Escape') toggleTerm();

    // History
    if (e.key === 'ArrowUp') {
      if (historyIdx > 0) {
        historyIdx--;
        input.value = history[historyIdx];
      }
    }
    if (e.key === 'ArrowDown') {
      if (historyIdx < history.length - 1) {
        historyIdx++;
        input.value = history[historyIdx];
      } else {
        historyIdx = history.length;
        input.value = '';
      }
    }
  });

  // Hotkey: Ctrl + ~ (Backtick) or Ctrl + Space
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && (e.key === '`' || e.key === '~')) {
      e.preventDefault();
      toggleTerm();
    }
  });

  // Refresh Lucide icons for the new HTML
  if (window.lucide) lucide.createIcons();
}

// ─── INTERACTIVE ACTION HUB (PHASE 2) ───────────────────
function initActionHub() {
  const hubHTML = `
    <div id="actionHub">
      <!-- Terminal Toggle -->
      <button id="termToggleBtn" class="hub-btn" title="Edwin-OS Terminal">
        <i data-lucide="terminal"></i>
      </button>
      <!-- AI Digital Brain Trigger -->
      <button id="aiToggle" class="hub-btn" title="Cerebro Digital AI">
        <i data-lucide="sparkles"></i>
      </button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', hubHTML);
  // Hub Listeners
  const termBtn = document.getElementById('termToggleBtn');
  const waBtn = document.getElementById('waButton');
  const aiBtn = document.getElementById('aiToggle');

  // Unified Toggle Logic (Globalized for Nexus UI)
  window.closeAllHubPanels = () => {
    const aiChat = document.getElementById('aiChat');
    const waChat = document.getElementById('waChat');
    const term = document.getElementById('edwinTerminal');
    const cryptoWidget = document.getElementById('cryptoLiveWidget');
    const spToast = document.getElementById('spToast');

    if (aiChat) aiChat.classList.remove('active');
    if (waChat) waChat.classList.remove('active');
    if (term) term.classList.remove('active');
    if (cryptoWidget) cryptoWidget.classList.remove('active');
    
    // UI Polish: Change toggle icons if they exist
    const clwToggle = document.getElementById('clwToggle');
    if (clwToggle) clwToggle.textContent = '+';
    
    // We don't necessarily hide social proof unless it's a small screen
    if (window.innerWidth < 768 && spToast) spToast.classList.remove('active');
  };


  if (termBtn) {
    termBtn.addEventListener('click', () => {
      const term = document.getElementById('edwinTerminal');
      const wasActive = term?.classList.contains('active');
      
      window.closeAllHubPanels();
      
      if (!wasActive && typeof window.toggleTerm === 'function') {
        window.toggleTerm();
      }
    });
  }

  if (aiBtn) {
    aiBtn.addEventListener('click', () => {
      // Logic for Nexus UI: Close others first
      const wasActive = document.getElementById('aiChat')?.classList.contains('active');
      const nexusFab = document.getElementById('aiFab');
      
      window.closeAllHubPanels();

      // If Nexus AI agent is installed, bridge the click to it
      if (nexusFab) {
        nexusFab.click();
        return;
      }

      if (!wasActive) {
        window.verifyIdentity(() => {
          const chat = document.getElementById('aiChat');
          if (chat) {
            chat.classList.add('active');
            const input = document.getElementById('aiInput');
            if (input) input.focus();
          }
        });
      }
    });
  }

  if (waBtn) {
    waBtn.addEventListener('click', () => {
      const waChat = document.getElementById('waChat');
      const wasActive = waChat?.classList.contains('active');
      
      window.closeAllHubPanels();
      
      if (waChat && !wasActive) {
        waChat.classList.add('active');
      } else if (!waChat) {
        // Fallback: Open WhatsApp link directly if no widget
        window.open('https://wa.me/573000000000', '_blank');
      }
    });
  }
}

// ─── DIGITAL BRAIN AI ASSISTANT (UPGRADED) ──────────────
function initDigitalBrain() {
  const brainHTML = `
    <div id="aiAssistant">
      <div id="aiChat">
        <div class="ai-header">
          <i data-lucide="brain"></i>
          <h4>Edwin's Digital Brain v2.0</h4>
          <button onclick="document.getElementById('aiChat').classList.remove('active')" style="pointer-events:all; margin-left:auto; background:none; border:none; color:var(--gold); font-size:1.5rem; cursor:pointer;">&times;</button>
        </div>
        <div class="ai-body" id="aiBody">
          <div class="chat-msg msg--bot">Protocolo de enlace activo. Soy el núcleo cognitivo de Edwin. ¿Qué arquitectura o estrategia deseas analizar hoy?</div>
        </div>
        <div class="ai-typing" id="aiTyping">Procesando datos neurales...</div>
        <div class="ai-footer">
          <input type="text" id="aiInput" placeholder="Consulta técnica..." autocomplete="off">
          <button id="aiSend"><i data-lucide="send"></i></button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', brainHTML);

  const toggle = document.getElementById('aiToggle');
  const chat = document.getElementById('aiChat');
  const input = document.getElementById('aiInput');
  const send = document.getElementById('aiSend');
  const body = document.getElementById('aiBody');
  const typing = document.getElementById('aiTyping');

  // Enhanced Knowledge Logic
  const getCoherentResponse = (query) => {
    const q = query.toLowerCase();

    // Personalized Identity
    const savedUser = JSON.parse(localStorage.getItem('edwin_user') || '{}');
    const uName = savedUser.name || 'Arquitecto';

    if (q.includes('hola') || q.includes('saludos')) {
      return `Hola ${uName}, un placer establecer vínculo neural contigo. Soy el nodo cognitivo de Edwin. ¿En qué protocolo o arquitectura técnica profundizamos hoy?`;
    }

    // Core Identity
    if (q.includes('quien') || q.includes('edwin')) {
      return `Edwin es un Arquitecto de Soluciones con especialidad en Web3 y IA. ${uName}, su visión es automatizar la creación de valor mediante sistemas descentralizados y algoritmos inteligentes.`;
    }

    // Services
    if (q.includes('servicio') || q.includes('que haces') || q.includes('puedes hacer')) {
      return "Mis capacidades principales incluyen: 1. Desarrollo de Ecosistemas Web3 (DeFi/NFTs), 2. Implementación de Agentes IA para Negocios, y 3. Estrategias de Growth Marketing basadas en datos.";
    }

    // Projects / Portfolio
    if (q.includes('proyecto') || q.includes('trabajo') || q.includes('portafolio')) {
      return "He diseñado infraestructuras para Bull Traders, arquitecturas de copy-trading en BingX y sistemas de automatización industrial. Puedes navegar por el terminal (ls) para ver el desglose técnico de cada uno.";
    }

    // WhatsApp / Contact
    if (q.includes('contacto') || q.includes('whatsapp') || q.includes('hablar')) {
      return "Para una sesión de arquitectura directa o consultoría, presiona el botón de WhatsApp en la esquina inferior del Action Hub.";
    }

    // General Tech / fallback
    return "Analizando consulta... Veo que estás interesado en protocolos tecnológicos. Aunque mi base de datos personalizada se enfoca en Edwin, puedo decirte que la clave hoy es la integración de IA con infraestructuras Web3.";
  };


  const addMsg = (text, owner) => {
    const msg = document.createElement('div');
    msg.className = `chat-msg msg--${owner}`;
    msg.textContent = text;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  };


  const handleSend = () => {
    const val = input.value.trim();
    if (!val) return;
    addMsg(val, 'user');
    input.value = '';
    typing.style.display = 'block';
    setTimeout(() => {
      typing.style.display = 'none';
      addMsg(getCoherentResponse(val), 'bot');
    }, 800 + Math.random() * 700);
  };


  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });

  if (window.lucide) lucide.createIcons();
}

// ─── 3D GLOBAL IMPACT GLOBE (PHASE 2) ───────────────────
function initGlobalGlobe() {
  const container = document.getElementById('globeContainer');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const geo = new THREE.IcosahedronGeometry(10, 2);
  const mat = new THREE.MeshPhongMaterial({ color: 0xfbbf24, wireframe: true, transparent: true, opacity: 0.2 });
  const sphere = new THREE.Mesh(geo, mat);
  globeGroup.add(sphere);

  const dotsGeo = new THREE.SphereGeometry(10, 32, 32);
  const dotsMat = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.15, transparent: true, opacity: 0.6 });
  const dots = new THREE.Points(dotsGeo, dotsMat);
  globeGroup.add(dots);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(20, 20, 20);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));
  camera.position.z = 25;

  let isDragging = false;
  let previousMouseX = 0;
  let previousMouseY = 0;

  container.addEventListener('mousedown', () => isDragging = true);
  window.addEventListener('mouseup', () => isDragging = false);
  container.addEventListener('mousemove', e => {
    if (isDragging) {
      globeGroup.rotation.y += (e.offsetX - previousMouseX) * 0.005;
      globeGroup.rotation.x += (e.offsetY - previousMouseY) * 0.005;
    }
    previousMouseX = e.offsetX;
    previousMouseY = e.offsetY;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) globeGroup.rotation.y += 0.002;
    renderer.render(scene, camera);
  }
  animate();
}

// ─── CYBERPUNK SOUND ENGINE (PHASE 2) ────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const soundBtn = document.getElementById('soundToggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const icon = soundBtn.querySelector('i');
      if (soundBtn.classList.contains('active')) {
        SoundEngine.disable();
        soundBtn.classList.remove('active');
        if (icon) icon.setAttribute('data-lucide', 'volume-x');
      } else {
        SoundEngine.enable();
        SoundEngine.success();
        soundBtn.classList.add('active');
        if (icon) icon.setAttribute('data-lucide', 'volume-2');
      }
      if (window.lucide) lucide.createIcons();
    });
  }
});

// ─── LIVE SYSTEMS DASHBOARD (PHASE 2) ───────────────────
(function initDashboard() {
  const latVal = document.getElementById('latVal');
  const aiVal = document.getElementById('aiVal');
  if (!latVal || !aiVal) return;
  setInterval(() => {
    const lat = Math.floor(15 + Math.random() * 20);
    latVal.textContent = `${lat}ms`;
    const ai = (95 + Math.random() * 4).toFixed(1);
    aiVal.textContent = `${ai}%`;
    const bars = document.querySelectorAll('.dash-progress');
    if (bars[0]) bars[0].style.width = `${lat * 2}%`;
    if (bars[1]) bars[1].style.width = `${ai}%`;
  }, 3000);
})();

// Accordion Logic
document.addEventListener('click', e => {
  const trigger = e.target.closest('.module-trigger');
  if (!trigger) return;
  const item = trigger.closest('.module-item');
  if (!item) return;
  e.preventDefault();
  const grid = item.closest('.modules-grid');
  if (grid) {
    grid.querySelectorAll('.module-item').forEach(other => {
      if (other !== item) other.classList.remove('active');
    });
  }
  item.classList.toggle('active');
});

// ─── PHASE 3: ULTRA-IMMERSION v2.0 (THE ENTRY PROTOCOLO) ──────
function initUltraImmersion() {
  const savedUser = JSON.parse(localStorage.getItem('edwin_user') || '{}');
  const onboardingDone = localStorage.getItem('onboarding_complete');

  if (onboardingDone) {
    document.body.classList.add('protocol-active');
  }

  const phase3HTML = `
    <!-- 0. Entry Portal -->
    <div id="entryPortal" style="${onboardingDone ? 'display:none;' : ''}">
      <div class="portal-gate">
        <div class="glitch-text mono">ERROR: SYSTEM_OFFLINE</div>
        <div class="glitch-desc mono" style="color: rgba(255,255,255,0.4); font-size: 0.7rem; margin-bottom: 20px;">PARA INICIAR OPRIME EL BOTÓN GO</div>
        <div class="glitch-arrows">
          <i class="lucide-chevron-down"></i>
        </div>
        <button class="gate-btn magnetic" id="initializeBtn" style="cursor: pointer; z-index: 100;">GO</button>
      </div>
    </div>

    <!-- 1. Full-Screen Biometric Scanner -->
    <div id="bioScanner">
      <div class="scanner-frame">
        <div class="scanner-radar"></div>
        <div class="scanner-laser"></div>
      </div>
      <div class="scanner-text mono">Escaneando Infraestructura Biométrica...</div>
    </div>

    <!-- 2. Identity Captive Portal -->
    <div id="identityForm">
      <div class="form-title mono">// ESTABLECIENDO VÍNCULO_DE_DATOS</div>
      <div class="form-group">
        <input type="text" id="userName" class="form-input" placeholder="INGRESA TU NOMBRE" autocomplete="off">
      </div>
      <div class="form-group">
        <input type="text" id="userWhatsApp" class="form-input" placeholder="WHATSAPP / TELEGRAM" autocomplete="off">
      </div>
      <button class="form-submit mono" id="submitIdentity">[ Handshake_Start ]</button>
    </div>

    <!-- HUD Sector Indicator -->
    <div id="hudSector">
      <div class="hud-pill" data-sector="hero">Sector: Home_Core</div>
      <div class="hud-pill" data-sector="projects">Sector: Dev_Factory</div>
      <div class="hud-pill" data-sector="about">Sector: Brain_Node</div>
      <div class="hud-pill" data-sector="contact">Sector: Handshake_Protocol</div>
    </div>

    <!-- Neural Link Canvas v2.0 -->
    <canvas id="neuralCanvas"></canvas>
  `;
  document.body.insertAdjacentHTML('beforeend', phase3HTML);

  const gate = document.getElementById('entryPortal');
  const initBtn = document.getElementById('initializeBtn');
  const scanner = document.getElementById('bioScanner');
  const idForm = document.getElementById('identityForm');
  const canvas = document.getElementById('neuralCanvas');
  const ctx = canvas.getContext('2d');

  let userData = { name: '', wa: '' };
  let bioVerified = false;

  // 1. Initial Handshake Click
  initBtn.addEventListener('click', () => {
    gate.style.opacity = '0';
    setTimeout(() => {
      gate.style.display = 'none';
      startScanner();
    }, 1000);
  });

  function startScanner() {
    scanner.classList.add('active');
    if (typeof SoundEngine !== 'undefined') SoundEngine.success();

    setTimeout(() => {
      scanner.querySelector('.scanner-text').textContent = "Puntos de acceso detectados. Captura de identidad requerida.";
      setTimeout(() => {
        idForm.style.display = 'block';
        if (typeof SoundEngine !== 'undefined') SoundEngine.click();
      }, 1000);
    }, 2500);
  }

  // Identity Form Submission
  document.getElementById('submitIdentity').addEventListener('click', () => {
    const name = document.getElementById('userName').value.trim();
    const wa = document.getElementById('userWhatsApp').value.trim();

    if (!name || !wa) {
      if (typeof SoundEngine !== 'undefined') SoundEngine.error();
      return;
    }

    userData = { name, wa };
    localStorage.setItem('edwin_user', JSON.stringify(userData));
    localStorage.setItem('onboarding_complete', 'true');

    idForm.style.display = 'none';
    scanner.querySelector('.scanner-text').textContent = "Identidad Verificada: " + name.toUpperCase() + "_GRANTED";

    setTimeout(() => {
      scanner.classList.remove('active');
      bioVerified = true;
      document.body.classList.add('protocol-active');
      console.log("Lead captured:", userData);
    }, 1500);
  });

  window.verifyIdentity = function (callback) {
    if (bioVerified) return callback();
    startScanner();
  };



  // 2. High-Realism Neural Particles (Interactive Core)
  let particles = [];
  const pCount = 80;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.init();
    }
    init() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = (Math.random() - 0.5) * 1;
      this.size = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.pulse = Math.random() * 0.02;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      this.alpha += this.pulse;
      if (this.alpha > 0.8 || this.alpha < 0.1) this.pulse *= -1;
    }
    draw() {
      ctx.fillStyle = `rgba(0, 212, 255, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < pCount; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          ctx.strokeStyle = `rgba(251, 191, 36, ${0.1 * (1 - dist / 150)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();

  // 3. Sector HUD Logic
  const pills = document.querySelectorAll('.hud-pill');
  const sections = {
    'hero': document.querySelector('.hero'),
    'projects': document.querySelector('#proyectos') || document.querySelector('.works-grid'),
    'about': document.querySelector('#ia') || document.querySelector('.about'),
    'contact': document.querySelector('#contacto')
  };


  window.addEventListener('scroll', () => {
    let current = "";
    for (let s in sections) {
      if (sections[s] && window.scrollY >= sections[s].offsetTop - 300) {
        current = s;
      }
    }
    pills.forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-sector') === current);
    });
  });
}

// Legacy WhatsApp Bot Code Purged.

// INITIALIZE ALL SYSTEMS
document.addEventListener('DOMContentLoaded', () => {
  // if (typeof initUltraImmersion === 'function') initUltraImmersion(); // Deshabilitado para mejorar la experiencia de usuario al cargar
  if (typeof initEdwinOS === 'function') initEdwinOS();
  // if (typeof initWhatsAppBot === 'function') initWhatsAppBot(); // Disabled: Merged with Nexus AI
  // if (typeof initDigitalBrain === 'function') initDigitalBrain(); // Disabled to prevent ID conflict with Nexus AI
  if (typeof initActionHub === 'function') initActionHub();
  if (typeof initGlobalGlobe === 'function') initGlobalGlobe();
});


