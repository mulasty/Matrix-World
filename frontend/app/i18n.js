/* MATRIX WORLD — lightweight runtime localization layer.
   No build step, no dependencies. Polish is the Matrix World default; English remains the fallback.
   This module intentionally translates only known UI strings/attributes so agent output, user content,
   model names, paths, logs, and telemetry are never rewritten. */
'use strict';

(() => {
  const STORAGE_KEY = 'matrix-world.locale.v1';
  const DEFAULT_LOCALE = 'pl';
  const SUPPORTED = ['pl', 'en'];

  const dict = {
    en: {
      'brand.name': 'MATRIX WORLD',
      'brand.tagline': 'AI-AGENT COMMAND CENTER',
      'boot.press': '▮ PRESS ANY KEY TO START',
      'nav.crew': 'CREW',
      'nav.work': 'WORK',
      'nav.build': 'BUILD',
      'nav.system': 'SYSTEM',
      'nav.agents': 'AGENTS',
      'nav.recruit': 'RECRUIT',
      'nav.commander': 'COMMANDER',
      'nav.tasks': 'TASKS',
      'nav.deliverables': 'DELIVERABLES',
      'nav.recipes': 'RECIPES',
      'nav.automation': 'AUTOMATION',
      'nav.quests': 'QUESTS',
      'nav.abilities': 'ABILITIES',
      'nav.channels': 'CHANNELS',
      'nav.settings': 'SETTINGS',
      'rail.sessions': 'SESSIONS',
      'rail.projects': 'PROJECTS',
      'rail.new': '+ NEW',
      'rail.add': '+ ADD',
      'shell.station': 'STATION',
      'shell.uplink': 'UPLINK',
      'shell.online': 'ONLINE',
      'connect.appearance': 'APPEARANCE',
      'connect.identity': 'IDENTITY',
      'connect.brain': 'THE BRAIN',
      'common.required': 'REQUIRED',
      'common.model': 'MODEL',
      'common.more': '＋ MORE',
      'common.back': '‹ BACK',
      'connect.wake': '⏼ WAKE OVERSEER ▸',
      'settings.providers': 'PROVIDERS',
      'settings.autonomy': 'AUTONOMY',
      'settings.nightshift': 'NIGHT SHIFT',
      'settings.permissions': 'PERMISSIONS',
      'settings.budget': 'BUDGET',
      'settings.models': 'MODELS',
      'settings.livevoice': 'LIVE VOICE',
      'settings.appearance': 'APPEARANCE',
      'settings.alerts': 'ALERTS',
      'settings.runtime': 'RUNTIME',
      'appearance.theme': 'PHOSPHOR THEME',
      'appearance.custom': 'CUSTOM',
      'appearance.hue': 'HUE',
      'appearance.saturation': 'SATURATION',
      'appearance.glow': 'GLOW',
      'appearance.brightness': 'BRIGHTNESS',
      'appearance.backdrop': 'BACKDROP',
      'aria.boot': 'Matrix World booting',
      'aria.stage': 'Live view of your agent station',
      'aria.topWidgets': 'Pinned widgets (top rail)',
      'aria.hideCrew': 'Hide the crew rail',
      'aria.showCrew': 'Show the crew rail',
      'placeholder.sessionSearch': '⌕ search sessions + transcripts'
    },
    pl: {
      'brand.name': 'MATRIX WORLD',
      'brand.tagline': 'CENTRUM DOWODZENIA MULTI-AGENTAMI',
      'boot.press': '▮ NACIŚNIJ DOWOLNY KLAWISZ, ABY ROZPOCZĄĆ',
      'nav.crew': 'AGENTY',
      'nav.work': 'PRACA',
      'nav.build': 'KONFIGURACJA',
      'nav.system': 'SYSTEM',
      'nav.agents': 'AGENTY',
      'nav.recruit': 'DODAJ AGENTA',
      'nav.commander': 'DOWÓDCA',
      'nav.tasks': 'ZADANIA',
      'nav.deliverables': 'WYNIKI',
      'nav.recipes': 'PROCEDURY',
      'nav.automation': 'AUTOMATYZACJE',
      'nav.quests': 'MISJE',
      'nav.abilities': 'MOŻLIWOŚCI',
      'nav.channels': 'KANAŁY',
      'nav.settings': 'USTAWIENIA',
      'rail.sessions': 'SESJE',
      'rail.projects': 'PROJEKTY',
      'rail.new': '+ NOWA',
      'rail.add': '+ DODAJ',
      'shell.station': 'CENTRALA',
      'shell.uplink': 'ŁĄCZE',
      'shell.online': 'ONLINE',
      'connect.appearance': 'WYGLĄD',
      'connect.identity': 'TOŻSAMOŚĆ',
      'connect.brain': 'MÓZG',
      'common.required': 'WYMAGANE',
      'common.model': 'MODEL',
      'common.more': '＋ WIĘCEJ',
      'common.back': '‹ WSTECZ',
      'connect.wake': '⏼ URUCHOM NADZORCĘ ▸',
      'settings.providers': 'DOSTAWCY',
      'settings.autonomy': 'AUTONOMIA',
      'settings.nightshift': 'TRYB NOCNY',
      'settings.permissions': 'UPRAWNIENIA',
      'settings.budget': 'BUDŻET',
      'settings.models': 'MODELE',
      'settings.livevoice': 'GŁOS NA ŻYWO',
      'settings.appearance': 'WYGLĄD',
      'settings.alerts': 'ALERTY',
      'settings.runtime': 'ŚRODOWISKO',
      'appearance.theme': 'MOTYW FOSFORU',
      'appearance.custom': 'WŁASNY',
      'appearance.hue': 'ODCIEŃ',
      'appearance.saturation': 'NASYCENIE',
      'appearance.glow': 'POŚWIATA',
      'appearance.brightness': 'JASNOŚĆ',
      'appearance.backdrop': 'TŁO',
      'aria.boot': 'Uruchamianie Matrix World',
      'aria.stage': 'Podgląd na żywo centrali agentów',
      'aria.topWidgets': 'Przypięte widżety',
      'aria.hideCrew': 'Ukryj panel agentów',
      'aria.showCrew': 'Pokaż panel agentów',
      'placeholder.sessionSearch': '⌕ szukaj w sesjach i rozmowach'
    }
  };

  const sourceText = {
    'STARNET': 'brand.name',
    'AI-AGENT HARNESS': 'brand.tagline',
    '▮ PRESS ANY KEY TO START': 'boot.press',
    'CREW': 'nav.crew',
    'WORK': 'nav.work',
    'BUILD': 'nav.build',
    'SYSTEM': 'nav.system',
    'AGENTS': 'nav.agents',
    'RECRUIT': 'nav.recruit',
    'COMMANDER': 'nav.commander',
    'TASKS': 'nav.tasks',
    'DELIVERABLES': 'nav.deliverables',
    'RECIPES': 'nav.recipes',
    'AUTOMATION': 'nav.automation',
    'QUESTS': 'nav.quests',
    'ABILITIES': 'nav.abilities',
    'CHANNELS': 'nav.channels',
    'SETTINGS': 'nav.settings',
    'SESSIONS': 'rail.sessions',
    'PROJECTS': 'rail.projects',
    '+ NEW': 'rail.new',
    '+ ADD': 'rail.add',
    'STATION': 'shell.station',
    'UPLINK': 'shell.uplink',
    'ONLINE': 'shell.online',
    'APPEARANCE': 'settings.appearance',
    'IDENTITY': 'connect.identity',
    'THE BRAIN': 'connect.brain',
    'REQUIRED': 'common.required',
    'MODEL': 'common.model',
    '＋ MORE': 'common.more',
    '‹ BACK': 'common.back',
    '⏼ WAKE OVERSEER ▸': 'connect.wake',
    'PROVIDERS': 'settings.providers',
    'AUTONOMY': 'settings.autonomy',
    'NIGHT SHIFT': 'settings.nightshift',
    'PERMISSIONS': 'settings.permissions',
    'BUDGET': 'settings.budget',
    'MODELS': 'settings.models',
    'LIVE VOICE': 'settings.livevoice',
    'ALERTS': 'settings.alerts',
    'RUNTIME': 'settings.runtime',
    'PHOSPHOR THEME': 'appearance.theme',
    'CUSTOM': 'appearance.custom',
    'HUE': 'appearance.hue',
    'SATURATION': 'appearance.saturation',
    'GLOW': 'appearance.glow',
    'BRIGHTNESS': 'appearance.brightness',
    'BACKDROP': 'appearance.backdrop'
  };

  const sourceAttrs = {
    'StarNet booting': 'aria.boot',
    'Live view of your agent station': 'aria.stage',
    'Pinned widgets (top rail)': 'aria.topWidgets',
    'Hide the crew rail': 'aria.hideCrew',
    'Show the crew rail': 'aria.showCrew',
    '⌕ search sessions + transcripts': 'placeholder.sessionSearch'
  };

  let locale = readLocale();
  let applying = false;
  let observer = null;

  function readLocale() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.includes(stored) ? stored : DEFAULT_LOCALE;
    } catch (_) {
      return DEFAULT_LOCALE;
    }
  }

  function t(key, vars) {
    const table = dict[locale] || dict.en;
    let out = table[key] != null ? table[key] : (dict.en[key] != null ? dict.en[key] : key);
    if (vars && typeof vars === 'object') {
      Object.keys(vars).forEach(name => {
        out = String(out).replaceAll('{' + name + '}', String(vars[name]));
      });
    }
    return out;
  }

  function buildReverseMap(source) {
    const map = Object.assign({}, source);
    for (const code of SUPPORTED) {
      const table = dict[code] || {};
      Object.keys(table).forEach(key => {
        const value = table[key];
        if (typeof value === 'string' && value) map[value] = key;
      });
    }
    return map;
  }

  const textToKey = buildReverseMap(sourceText);
  const attrToKey = buildReverseMap(sourceAttrs);

  function shouldSkip(node) {
    const el = node && (node.nodeType === 1 ? node : node.parentElement);
    return !el || !!el.closest('script,style,textarea,code,pre,[data-i18n-ignore]');
  }

  function translateTextNode(node) {
    if (!node || node.nodeType !== 3 || shouldSkip(node)) return;
    const value = node.nodeValue || '';
    const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!match || !match[2]) return;
    const key = textToKey[match[2]];
    if (!key) return;
    const next = t(key);
    if (next !== match[2]) node.nodeValue = match[1] + next + match[3];
  }

  function translateElementAttrs(el) {
    if (!el || el.nodeType !== 1 || shouldSkip(el)) return;
    for (const attr of ['title', 'aria-label', 'placeholder']) {
      const value = el.getAttribute && el.getAttribute(attr);
      const key = value && attrToKey[value];
      if (key) el.setAttribute(attr, t(key));
    }
    const key = el.getAttribute && el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  }

  function apply(root) {
    if (!root || applying) return;
    applying = true;
    try {
      if (root.nodeType === 3) {
        translateTextNode(root);
        return;
      }
      if (root.nodeType === 1) translateElementAttrs(root);
      const scope = root.nodeType === 9 ? root.documentElement : root;
      if (!scope) return;

      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) translateTextNode(node);

      if (scope.querySelectorAll) {
        scope.querySelectorAll('[title],[aria-label],[placeholder],[data-i18n]').forEach(translateElementAttrs);
      }
    } finally {
      applying = false;
    }
  }

  function syncLanguageControl() {
    document.querySelectorAll('[data-mw-locale]').forEach(btn => {
      const on = btn.getAttribute('data-mw-locale') === locale;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  function mountLanguageControl() {
    if (document.getElementById('mw-language')) return;
    const stats = document.querySelector('#topbar .tb-stats');
    if (!stats) return;
    const wrap = document.createElement('div');
    wrap.id = 'mw-language';
    wrap.className = 'mw-language';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Język / Language');
    wrap.innerHTML =
      '<button type="button" data-mw-locale="pl" aria-pressed="false" title="Polski">PL</button>' +
      '<span aria-hidden="true">/</span>' +
      '<button type="button" data-mw-locale="en" aria-pressed="false" title="English">EN</button>';
    wrap.addEventListener('click', ev => {
      const btn = ev.target && ev.target.closest('[data-mw-locale]');
      if (btn) setLocale(btn.getAttribute('data-mw-locale'));
    });
    stats.insertBefore(wrap, stats.firstChild);
    syncLanguageControl();
  }

  function setLocale(next) {
    if (!SUPPORTED.includes(next)) return false;
    locale = next;
    try { localStorage.setItem(STORAGE_KEY, locale); } catch (_) {}
    document.documentElement.lang = locale;
    document.title = t('brand.name');
    apply(document);
    syncLanguageControl();
    try {
      window.dispatchEvent(new CustomEvent('matrix:locale-change', { detail: { locale } }));
    } catch (_) {}
    return true;
  }

  function startObserver() {
    if (observer || typeof MutationObserver === 'undefined') return;
    observer = new MutationObserver(records => {
      if (applying) return;
      for (const record of records) {
        record.addedNodes.forEach(node => apply(node));
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    document.documentElement.lang = locale;
    document.title = t('brand.name');
    apply(document);
    mountLanguageControl();
    startObserver();
  }

  window.MatrixI18n = {
    t,
    apply,
    setLocale,
    getLocale: () => locale,
    supported: () => SUPPORTED.slice(),
    dictionaries: dict
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
