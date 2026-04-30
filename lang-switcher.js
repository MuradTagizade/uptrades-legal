// UpTrades Shared Language Switcher
// Injects dropdown into .header, manages lang state across pages

(function () {
  const LANGS = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'tr', flag: '🇹🇷', label: 'Türkçe' },
    { code: 'az', flag: '🇦🇿', label: 'Azərbaycan' },
    { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  ];

  const saved = localStorage.getItem('uptrades-lang') || 'en';

  function buildDropdown() {
    const header = document.querySelector('.header');
    if (!header) return;

    // Convert header to flex layout
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.textAlign = 'left';
    header.style.padding = '16px 24px';

    // Wrap existing header children in a left div (skip if header is empty)
    const hasChildren = Array.from(header.childNodes).some(
      n => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim())
    );
    
    header.style.justifyContent = hasChildren ? 'space-between' : 'flex-end';

    if (hasChildren) {
      const leftDiv = document.createElement('div');
      leftDiv.style.display = 'flex';
      leftDiv.style.alignItems = 'center';
      leftDiv.style.gap = '16px';
      while (header.firstChild) leftDiv.appendChild(header.firstChild);
      leftDiv.querySelectorAll('br').forEach(br => br.remove());
      header.appendChild(leftDiv);
    }

    // Build dropdown HTML
    const dd = document.createElement('div');
    dd.className = 'lang-dropdown';
    dd.innerHTML = `
      <button class="lang-toggle" id="langToggle">
        🌐 ${LANGS.find(l => l.code === saved).label}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="lang-menu" id="langMenu">
        ${LANGS.map(l => `<div class="lang-option${l.code === saved ? ' active' : ''}" data-lang="${l.code}">${l.flag} ${l.label}</div>`).join('')}
      </div>`;
    header.appendChild(dd);

    // Remove old lang-switch buttons
    document.querySelectorAll('.lang-switch').forEach(el => el.remove());

    // Events
    dd.querySelector('.lang-toggle').addEventListener('click', function (e) {
      e.stopPropagation();
      dd.querySelector('.lang-menu').classList.toggle('open');
      this.classList.toggle('open');
    });

    dd.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', function () {
        switchLang(this.dataset.lang);
      });
    });

    document.addEventListener('click', function () {
      dd.querySelector('.lang-menu').classList.remove('open');
      dd.querySelector('.lang-toggle').classList.remove('open');
    });
  }

  function switchLang(lang) {
    localStorage.setItem('uptrades-lang', lang);
    // Update content visibility
    document.querySelectorAll('.lang-content').forEach(c => c.classList.remove('active'));
    const target = document.getElementById('content-' + lang);
    if (target) target.classList.add('active');

    // Update dropdown label
    const info = LANGS.find(l => l.code === lang);
    const toggle = document.getElementById('langToggle');
    if (toggle) toggle.firstChild.textContent = '🌐 ' + info.label + ' ';

    // Update active option
    document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
    document.querySelector(`.lang-option[data-lang="${lang}"]`)?.classList.add('active');

    // Update page title text if data-i18n exists
    const titleEl = document.querySelector('[data-i18n-title]');
    if (titleEl && titleEl.dataset.i18n) {
      try {
        const titles = JSON.parse(titleEl.dataset.i18n);
        titleEl.textContent = titles[lang] || titles.en;
      } catch (e) { /* ignore */ }
    }

    // Update back link text if data-i18n-back exists
    const backEl = document.querySelector('[data-i18n-back]');
    if (backEl && backEl.dataset.i18n) {
      try {
        const texts = JSON.parse(backEl.dataset.i18n);
        backEl.textContent = '← ' + (texts[lang] || texts.en);
      } catch (e) { /* ignore */ }
    }

    // Close menu
    document.getElementById('langMenu')?.classList.remove('open');
    document.getElementById('langToggle')?.classList.remove('open');
  }

  // Inject shared CSS for dropdown
  const style = document.createElement('style');
  style.textContent = `
    .lang-dropdown{position:relative}
    .lang-toggle{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#F8FAFC;padding:8px 14px;border-radius:10px;cursor:pointer;font-family:'Inter',sans-serif;font-size:0.85rem;font-weight:500;display:flex;align-items:center;gap:6px;transition:all 0.2s;white-space:nowrap}
    .lang-toggle:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2)}
    .lang-toggle svg{transition:transform 0.2s}
    .lang-toggle.open svg{transform:rotate(180deg)}
    .lang-menu{position:absolute;top:calc(100% + 8px);right:0;background:rgba(16,22,36,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;min-width:160px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 12px 40px rgba(0,0,0,0.4);display:none;z-index:20}
    .lang-menu.open{display:block}
    .lang-option{padding:10px 16px;cursor:pointer;font-size:0.85rem;color:#9BA1A6;transition:all 0.15s;display:flex;align-items:center;gap:8px}
    .lang-option:hover{background:rgba(255,255,255,0.08);color:#F8FAFC}
    .lang-option.active{color:#30D5C8;font-weight:600}
  `;
  document.head.appendChild(style);

  // Initialize
  document.addEventListener('DOMContentLoaded', function () {
    buildDropdown();
    // Apply saved language
    if (saved !== 'en') switchLang(saved);
  });
})();
