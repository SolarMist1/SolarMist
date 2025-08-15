/* ==========================================================
   SolarMist — Main JS (modular, tidy, future-proof)
   Sections:
   00) Helpers & Config
   01) Animations on scroll
   02) Mobile Nav (ARIA + transitions)
   03) Smooth scrolling (offset-aware)
   04) Countdown (months to launch)
   05) Ripple effect on CTAs
   06) Features slider dots (mobile swipe helper)
   07) Privacy popup
   08) Survey (multi-step + shared progress bar)
   09) Page scroll progress bar (no-op unless survey active)
   10) HIW arrows (horizontal scroll)
   11) Sticky CTA banner logic
   12) FAQ accordion (with ARIA)
   13) Header scroll state
   14) Forms (reportValidity, timestamp, async POST, redirect)
   15) Share button
========================================================== */

(() => {
  'use strict';

  /* -----------------------------
     00) Helpers & Config
  ----------------------------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  const throttle = (fn, wait = 100) => {
    let t = 0;
    return (...args) => {
      const now = Date.now();
      if (now - t >= wait) { t = now; fn(...args); }
    };
  };

  const CONFIG = {
    MOBILE_MAX: 800,                    // match CSS breakpoint
    LAUNCH_DATE_ISO: '2026-05-01T00:00:00',
    THANKS_URL_DEFAULT: '/thanks/',     // align with forms
    PROGRESS_BAR_ID: 'progressBar',     // shared top bar
    SURVEY_PROGRESS_CLASS: 'is-survey', // class to claim the bar for survey
  };

  // Cache frequently used nodes
  const DOM = {
    docEl: document.documentElement,
    body: document.body,
    header: $('.site-header'),
    pageProgress: $(`#${CONFIG.PROGRESS_BAR_ID}`),
    mobileToggle: $('#mobileToggle'),
    mobileMenu: $('#mobileMenu'),
    featuresTrack: $('#featuresTrack'),
    featuresDots:  $('#featuresDots'),
    hiwCards: $('.hiw-cards'),
    hiwLeft:  $('.hiw-arrow-left'),
    hiwRight: $('.hiw-arrow-right'),
    stickyBanner: $('.sticky-cta-banner'),
    hero: $('.hero'),
    venuesLikeSection: $('#get-involved') || $('.engage-section') || $('.signup-section'),
    footer: $('footer'),
    privacyLink: $('.privacy-link'),
    privacyWrapper: $('.privacy-popup-wrapper'),
    privacyClose: $('.close-btn'),
    countdownEl: $('#countdown-timer'),
    shareBtn: $('#shareBtn'),
    formStatus: $('#form-status'), // optional live region if present
    heroForm: $('#heroForm'),
    launchForm: $('#launchForm'),
    surveyForm: $('#surveyForm'),
  };

  const getHeaderOffset = () => DOM.header?.getBoundingClientRect().height ?? 65;

  /* -----------------------------
   01) Animations on scroll (debounced, animate-once)
----------------------------- */
const initAnimations = () => {
  const targets = $$('[data-animate]');
  if (!targets.length) return;

  const headerH = Math.ceil(getHeaderOffset()); // uses your helper
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      const el = entry.target;

      if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
        el.classList.add('visible');
        // default: animate once (prevents flicker)
        if (!el.hasAttribute('data-animate-repeat')) {
          obs.unobserve(el);
        }
      } else {
        // only remove if explicitly allowed to repeat
        if (el.hasAttribute('data-animate-repeat')) {
          el.classList.remove('visible');
        }
      }
    });
  }, {
    // shrink the top by header height, add a little bottom hysteresis
    root: null,
    threshold: [0, 0.15, 0.5, 1],
    rootMargin: `-${headerH}px 0px -15% 0px`
  });

  targets.forEach(el => io.observe(el));
};


  /* -----------------------------
     02) Mobile Nav (ARIA + transitions + focus trap + Esc)
  ----------------------------- */
  const initMobileNav = () => {
    const { mobileToggle, mobileMenu, body } = DOM;
    if (!mobileToggle || !mobileMenu) return;

    let isAnimating = false;
    let lastFocus = null;

    const getFocusable = () =>
      $$('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])', mobileMenu)
        .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);

    const openMenu = () => {
      if (isAnimating) return;
      isAnimating = true;
      lastFocus = document.activeElement;

      mobileMenu.style.display = 'flex';
      body.classList.add('nav-open');
      requestAnimationFrame(() => {
        mobileMenu.classList.add('open');
        mobileToggle.classList.add('open');
        mobileToggle.setAttribute('aria-expanded', 'true');
        // move focus into the menu
        const focusables = getFocusable();
        (focusables[0] || mobileMenu).focus({ preventScroll: true });
        isAnimating = false;
      });
    };

    const closeMenu = () => {
      if (isAnimating) return;
      isAnimating = true;
      mobileMenu.classList.remove('open');
      mobileToggle.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('nav-open');
      const onEnd = () => {
        mobileMenu.style.display = 'none';
        mobileMenu.removeEventListener('transitionend', onEnd);
        // return focus to the toggle
        (lastFocus || mobileToggle).focus({ preventScroll: true });
        isAnimating = false;
      };
      mobileMenu.addEventListener('transitionend', onEnd);
    };

    // Toggle
    on(mobileToggle, 'click', () => {
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Close when clicking a link
    $$('.mobile-nav-overlay a').forEach(a => on(a, 'click', closeMenu, { passive: true }));

    // Esc to close
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        e.preventDefault();
        closeMenu();
      }
    });

    // Focus trap while open
    on(mobileMenu, 'keydown', (e) => {
      if (e.key !== 'Tab' || !mobileMenu.classList.contains('open')) return;
      const focusables = getFocusable();
      if (!focusables.length) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  };

  /* -----------------------------
     03) Smooth scrolling (offset-aware)
  ----------------------------- */
  const initSmoothScroll = () => {
    $$('a[href^="#"]').forEach(anchor => {
      on(anchor, 'click', (e) => {
        const id = anchor.getAttribute('href');
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();

        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
        if (Math.abs(window.pageYOffset - targetTop) < 5) return;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }, { passive: false });
    });

    // Remove focus outline after click on desktop nav
    $$('.site-nav a').forEach(link => on(link, 'click', () => link.blur(), { passive: true }));
  };

  /* -----------------------------
     04) Countdown (months to launch)
  ----------------------------- */
  const initCountdown = () => {
    const { countdownEl } = DOM;
    if (!countdownEl) return;

    const launchDate = new Date(CONFIG.LAUNCH_DATE_ISO);
    const update = () => {
      const now = new Date();
      if (now >= launchDate) { countdownEl.textContent = "We're live!"; return; }
      const months =
        (launchDate.getFullYear() - now.getFullYear()) * 12 +
        (launchDate.getMonth() - now.getMonth()) -
        (now.getDate() > launchDate.getDate() ? 1 : 0);
      countdownEl.textContent = `Launching in: ${months} month${months !== 1 ? 's' : ''}`;
    };

    update();
    setInterval(update, 3600000); // hourly
  };

  /* -----------------------------
     05) Ripple effect on CTAs
  ----------------------------- */
  const initRipples = () => {
    $$('.cta-button, .inline-email-form button').forEach(btn => {
      on(btn, 'click', (e) => {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const r = btn.getBoundingClientRect();
        const size = Math.max(r.width, r.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - r.left - size / 2}px`;
        ripple.style.top = `${e.clientY - r.top - size / 2}px`;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  };

  /* -----------------------------
     06) Features slider dots — build + sync (idempotent)
  ----------------------------- */
  const initFeaturesDots = () => {
    const track   = DOM.featuresTrack;
    const dotsWrap= DOM.featuresDots;
    if (!track || !dotsWrap) return;

    const cards = Array.from(track.querySelectorAll('.feature'));
    if (!cards.length) return;

    if (dotsWrap.dataset.built === '1') return; // avoid duplicates on re-init
    dotsWrap.innerHTML = cards.map((_, i) =>
      `<button type="button" class="features-dot" aria-label="Go to feature ${i + 1}"></button>`
    ).join('');
    dotsWrap.dataset.built = '1';

    const dots = Array.from(dotsWrap.querySelectorAll('.features-dot'));
    const setActive = (idx) => dots.forEach((d,i)=>d.classList.toggle('active', i===idx));
    setActive(0);

    const getCenteredIndex = () => {
      const t = track.getBoundingClientRect();
      const centerX = t.left + t.width/2;
      let best=0, bestDist=Infinity;
      cards.forEach((c,i)=>{
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width/2;
        const d = Math.abs(cx - centerX);
        if (d < bestDist){ best=i; bestDist=d; }
      });
      return best;
    };

    const syncActive = throttle(()=> setActive(getCenteredIndex()), 80);
    on(track, 'scroll', syncActive, { passive:true });
    on(window, 'resize', syncActive, { passive:true });

    // Force start at first card on mobile (respect scroll-padding)
    const spLeft = parseFloat(getComputedStyle(track).scrollPaddingLeft || '0');
    const snapFirst = () => {
      if (window.matchMedia('(max-width: 900px)').matches){
        track.scrollTo({ left: cards[0].offsetLeft - spLeft, behavior: 'auto' });
        setActive(0);
      } else {
        track.scrollLeft = 0;
        setActive(0);
      }
    };
    requestAnimationFrame(snapFirst);
    on(window, 'pageshow', snapFirst);
    on(window, 'orientationchange', () => setTimeout(snapFirst, 150));
    dots.forEach((dot, i) => on(dot, 'click', () => {
      const left = cards[i].offsetLeft - spLeft;
      track.scrollTo({ left, behavior: 'smooth' });
    }));
  };

  /* -----------------------------
     07) Privacy popup (Esc to close)
  ----------------------------- */
  const initPrivacy = () => {
    const { privacyLink, privacyWrapper, privacyClose } = DOM;
    if (!privacyLink || !privacyWrapper) return;

    const show = () => { privacyWrapper.style.display = 'flex'; };
    const hide = () => { privacyWrapper.style.display = 'none'; };

    on(privacyLink, 'click', (e) => { e.preventDefault(); show(); });
    on(privacyClose, 'click', hide);
    on(privacyWrapper, 'click', (e) => { if (e.target === privacyWrapper) hide(); });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') hide(); });
  };

/* -----------------------------
   08) Survey (multi-step + shared progress bar)
----------------------------- */
const initSurvey = () => {
  const form = DOM.surveyForm;
  const bar = DOM.pageProgress;
  const container = bar?.parentElement;
  if (!form || !bar || !container) return;

  const questions = $$('.question', form);
  if (!questions.length) return; // don't expose the bar if there's no survey

  let current = 0;
  const OPTIONAL_INDEXES = new Set([6]); // Q7 optional (0-based)

  // Claim the bar for survey + raise its container above the header
  bar.classList.add(CONFIG.SURVEY_PROGRESS_CLASS);
  container.classList.add('survey-active');

  // Make the progressbar accessible while the survey owns it
  container.setAttribute('aria-hidden', 'false');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');

  const showQuestion = (idx) => {
    questions.forEach((q, i) => q.classList.toggle('active', i === idx));
    const pct = (idx / questions.length) * 100;    // keep your original scale
    bar.style.width = `${pct}%`;
    bar.setAttribute('aria-valuenow', String(Math.round(pct)));
  };

  showQuestion(current);

  // Auto-advance on radio select
  $$('input[type="radio"]', form).forEach(input => {
    on(input, 'change', () => {
      const parent = input.closest('.question');
      const options = $$("input[type='radio']", parent);
      const answered = options.some(r => r.checked);
      if (answered && current < questions.length - 1) {
        current++;
        showQuestion(current);
      }
    });
  });

  // Next buttons with minimal validation (radios/checkboxes/textarea)
  $$('.next-btn', form).forEach(btn => {
    on(btn, 'click', (e) => {
      e.preventDefault();
      const q = questions[current];
      const inputs = $$('input, textarea', q);

      let answered = false;
      inputs.forEach(inp => {
        if ((inp.type === 'radio' || inp.type === 'checkbox') && inp.checked) answered = true;
        if (inp.tagName === 'TEXTAREA' && inp.value.trim() !== '') answered = true;
      });

      if (!answered && !OPTIONAL_INDEXES.has(current)) {
        alert('Please select or enter an answer before continuing.');
        return;
      }
      if (current < questions.length - 1) {
        current++;
        showQuestion(current);
      }
    });
  });

  // Back buttons
  $$('.back-btn', form).forEach(btn => {
    on(btn, 'click', (e) => {
      e.preventDefault();
      if (current > 0) { current--; showQuestion(current); }
    });
  });

  // Release the progress bar after submit (redirect follows)
  on(form, 'submit', () => {
    container.setAttribute('aria-hidden', 'true');
    container.classList.remove('survey-active');
    bar.classList.remove(CONFIG.SURVEY_PROGRESS_CLASS);
  });
};


  /* -----------------------------
     09) Page scroll progress bar
     (kept inert unless survey claims it)
  ----------------------------- */
  const initPageProgress = () => {
    const bar = DOM.pageProgress;
    const container = bar?.parentElement;
    if (!bar || !container) return;

    const update = throttle(() => {
      // Survey owns the bar; keep hidden otherwise
      if (!bar.classList.contains(CONFIG.SURVEY_PROGRESS_CLASS)) {
        bar.style.width = '0%';
      }
    }, 50);

    on(window, 'scroll', update, { passive: true });
    update();
  };

  /* -----------------------------
     10) HIW arrows (horizontal scroll)
  ----------------------------- */
  const initHIWArrows = () => {
    const { hiwCards, hiwLeft, hiwRight } = DOM;
    if (!hiwCards || !hiwLeft || !hiwRight) return;

    // ARIA labels for accessibility
    hiwLeft.setAttribute('aria-label', 'Scroll steps left');
    hiwRight.setAttribute('aria-label', 'Scroll steps right');

    const step = () => Math.min(hiwCards.clientWidth * 0.9, 600);
    on(hiwLeft, 'click', () => hiwCards.scrollBy({ left: -step(), behavior: 'smooth' }));
    on(hiwRight, 'click', () => hiwCards.scrollBy({ left: step(),  behavior: 'smooth' }));
  };

  /* -----------------------------
     11) Sticky CTA banner logic
  ----------------------------- */
  const initStickyCTA = () => {
    const { stickyBanner, hero, venuesLikeSection, footer } = DOM;
    if (!stickyBanner || !hero) return;

    const isHome = location.pathname === '/' || location.pathname.endsWith('/index.html');
    const isMobile = () => window.innerWidth <= CONFIG.MOBILE_MAX;
    const buffer = 100;

    const visible = (rect) =>
      rect && rect.top < window.innerHeight + buffer && rect.bottom > -buffer;

    const handle = throttle(() => {
      const launchRect = venuesLikeSection?.getBoundingClientRect();
      const footerRect = footer?.getBoundingClientRect();

      if (isMobile()) {
        if (visible(launchRect) || visible(footerRect)) stickyBanner.classList.remove('visible');
        else stickyBanner.classList.add('visible');
        return;
      }

      if (!isHome) { stickyBanner.classList.add('visible'); return; }

      const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
      if ((window.scrollY > heroBottom - 80 - buffer) && !visible(launchRect) && !visible(footerRect)) {
        stickyBanner.classList.add('visible');
      } else {
        stickyBanner.classList.remove('visible');
      }
    }, 80);

    setTimeout(() => {
      handle();
      on(window, 'scroll', handle, { passive: true });
      on(window, 'resize', handle, { passive: true });
    }, 50);
  };

  /* -----------------------------
     12) FAQ accordion (single open + ARIA)
  ----------------------------- */
  const initFAQ = () => {
    $$('.faq-item').forEach((item, i) => {
      const btn = $('.faq-question', item);
      const ans = $('.faq-answer', item);
      if (!btn || !ans) return;

      // Ensure answer has an id and button references it
      if (!ans.id) ans.id = `faq-a${i}`;
      btn.setAttribute('aria-controls', ans.id);
      btn.setAttribute('aria-expanded', 'false');

      on(btn, 'click', () => {
        const wasActive = item.classList.contains('active');
        // close all
        $$('.faq-item').forEach(it => {
          it.classList.remove('active');
          const b = $('.faq-question', it);
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        // open this one if it was closed
        if (!wasActive) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  };

  /* -----------------------------
     13) Header scroll state
  ----------------------------- */
  const initHeaderScroll = () => {
    const { header } = DOM;
    if (!header) return;

    const apply = throttle(() => {
      const sc = window.scrollY || DOM.docEl.scrollTop;
      header.classList.toggle('scrolled', sc > 8);
    }, 50);

    apply();
    on(window, 'scroll', apply, { passive: true });
  };

  /* -----------------------------
     14) Forms (reportValidity + async POST + redirect)
  ----------------------------- */
  const initForms = () => {
    const forms = [DOM.heroForm, DOM.launchForm, DOM.surveyForm].filter(Boolean);
    if (!forms.length) return;

    const stamp = (form) => {
      if (!form.querySelector('input[name="ts"]')) {
        const ts = document.createElement('input');
        ts.type = 'hidden'; ts.name = 'ts'; ts.value = String(Date.now());
        form.appendChild(ts);
      }
    };

    forms.forEach(form => {
      on(form, 'submit', async (e) => {
        e.preventDefault();

        // Native validity (works even if you keep novalidate on some forms)
        if (!form.reportValidity()) return;

        stamp(form);

        // Announce status (if live region exists)
        if (DOM.formStatus) DOM.formStatus.textContent = 'Submitting…';

        // Disable submit button to avoid double posts
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) { submitBtn.setAttribute('aria-busy', 'true'); submitBtn.disabled = true; }

        try {
          await fetch(form.action, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: new FormData(form)
          });
        } catch (_) {
          // swallow and still redirect
        }

        const redirect = form.querySelector('input[name="_redirect"]')?.value || CONFIG.THANKS_URL_DEFAULT;
        window.location.href = redirect;
      });
    });
  };

  /* -----------------------------
     15) Share button
  ----------------------------- */
  const initShare = () => {
    const { shareBtn } = DOM;
    if (!shareBtn) return;

    const shareData = {
      title: 'SolarMist',
      text: 'I just joined SolarMist — touch-free sunscreen booths. Join the launch list:',
      url: 'https://solarmist.co.uk/?ref=thankyou'
    };

    on(shareBtn, 'click', async () => {
      if (navigator.share) {
        try { await navigator.share(shareData); } catch (_) {}
      } else {
        $('.share-links')?.classList.add('open');
        shareBtn.textContent = 'Choose a share option ↓';
      }
    });
  };

  /* -----------------------------
     Init on DOM ready
  ----------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    initMobileNav();
    initSmoothScroll();
    initCountdown();
    initRipples();
    initFeaturesDots();   // build dots (single implementation)
    initPrivacy();
    initSurvey();         // claims top progress bar if survey present
    initPageProgress();   // inert unless survey active
    initHIWArrows();
    initStickyCTA();
    initFAQ();
    initHeaderScroll();
    initForms();
    initShare();
  });

})();
