/* ==========================================================
   SolarMist — Main JS (modular, tidy, future-proof)
   Sections:
   00) Helpers & Config
   01) Animations on scroll
   02) Mobile Nav (ARIA + transitions)
   03) Smooth scrolling (offset-aware)
   04) Countdown (months to launch)
   05) Ripple effect on CTAs
   06) Responsive Features grid (mobile swipe)
   07) Privacy popup
   08) Survey (multi-step + shared progress bar)
   09) Page scroll progress bar (coexists with survey)
   10) HIW arrows (horizontal scroll)
   11) Sticky CTA banner logic
   12) FAQ accordion
   13) Header scroll state
   14) Forms (timestamp, async POST, redirect)
   15) Share button
========================================================== */

(() => {
  'use strict';

  /* -----------------------------
     00) Helpers & Config
  ----------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
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
    OFFSET: 45,                          // header height offset for anchors
    MOBILE_MAX: 767,
    LAUNCH_DATE_ISO: '2026-05-01T00:00:00',
    THANKS_URL_DEFAULT: '/thanks',       // fallback if _redirect not present
    PROGRESS_BAR_ID: 'progressBar',      // shared top bar
    SURVEY_PROGRESS_CLASS: 'is-survey',  // class to claim the bar for survey
  };

  // Cache frequently used nodes
  const DOM = {
    docEl: document.documentElement,
    body: document.body,
    header: $('.site-header'),
    pageProgress: $(`#${CONFIG.PROGRESS_BAR_ID}`),
    mobileToggle: $('#mobileToggle'),
    mobileMenu: $('#mobileMenu'),
    featuresGrid: $('.features-grid'),
    hiwCards: $('.hiw-cards'),
    hiwLeft: $('.hiw-arrow-left'),
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

  /* -----------------------------
     01) Animations on scroll
  ----------------------------- */
  const initAnimations = () => {
    const targets = $$('[data-animate]');
    if (!targets.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        e.target.classList.toggle('visible', e.isIntersecting);
      });
    }, { threshold: 0.1 });

    targets.forEach(el => io.observe(el));
  };

  /* -----------------------------
     02) Mobile Nav (ARIA + transitions)
  ----------------------------- */
  const initMobileNav = () => {
    const { mobileToggle, mobileMenu, body } = DOM;
    if (!mobileToggle || !mobileMenu) return;

    let isAnimating = false;

    const openMenu = () => {
      if (isAnimating) return;
      isAnimating = true;
      mobileMenu.style.display = 'flex';
      body.classList.add('nav-open');
      requestAnimationFrame(() => {
        mobileMenu.classList.add('open');
        mobileToggle.classList.add('open');
        mobileToggle.setAttribute('aria-expanded', 'true');
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
        isAnimating = false;
      };
      mobileMenu.addEventListener('transitionend', onEnd);
    };

    on(mobileToggle, 'click', () => {
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });

    $$('.mobile-nav-overlay a').forEach(a => on(a, 'click', closeMenu));
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

        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - CONFIG.OFFSET;
        const diff = Math.abs(window.pageYOffset - targetTop);
        if (diff < 5) return;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      });
    });

    // Remove focus outline after click on desktop nav
    $$('.site-nav a').forEach(link => on(link, 'click', () => link.blur()));
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
      if (now >= launchDate) {
        countdownEl.textContent = "We're live!";
        return;
      }
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

  /* 16) Feature slider dots — build + sync (with iOS scroll fallback) */
(function () {
  const track = document.getElementById('featuresTrack');
  const dotsWrap = document.getElementById('featuresDots');
  if (!track || !dotsWrap) return;

  const mq = window.matchMedia('(max-width: 900px)');
  const cards = Array.from(track.querySelectorAll('.feature'));
  if (!cards.length) return;

  // Build dots
  dotsWrap.innerHTML = cards.map((_, i) =>
    `<button type="button" class="features-dot" aria-label="Go to feature ${i + 1}"></button>`
  ).join('');
  const dots = Array.from(dotsWrap.querySelectorAll('.features-dot'));

  const setActive = (idx) => {
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  };
  setActive(0);

  // Prefer IO inside the scroller; if it misbehaves, we’ll fall back to scroll math
  let usedFallback = false;
  let io;

  const enableObserver = () => {
    try {
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = cards.indexOf(entry.target);
          if (i > -1) setActive(i);
        });
      }, { root: track, threshold: 0.55 });
      cards.forEach(c => io.observe(c));
    } catch {
      usedFallback = true;
    }
  };

  const throttle = (fn, wait = 80) => {
    let t = 0; return (...a) => { const n = Date.now(); if (n - t >= wait){ t = n; fn(...a);} };
  };

  const updateFromScroll = throttle(() => {
    // card width + gap
    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.gap) || 0;
    const cardW = cards[0].getBoundingClientRect().width;
    const step = cardW + gap;
    const idx = Math.round(track.scrollLeft / step);
    setActive(Math.max(0, Math.min(idx, cards.length - 1)));
  });

  const enableFallback = () => {
    usedFallback = true;
    track.addEventListener('scroll', updateFromScroll, { passive: true });
    window.addEventListener('resize', updateFromScroll);
    updateFromScroll();
  };

  const setup = () => {
    // Show dots only on mobile
    dotsWrap.style.display = mq.matches ? 'flex' : 'none';

    if (mq.matches) {
      enableObserver();
      // Some iOS Safari builds don’t fire IO reliably for horizontal scrollers
      // Kick the fallback if we don’t see an update quickly
      setTimeout(() => { if (!dots.some(d => d.classList.contains('active'))) enableFallback(); }, 120);
    } else {
      if (io) { cards.forEach(c => io.unobserve(c)); io.disconnect(); }
      track.removeEventListener('scroll', updateFromScroll);
    }
  };

  // Dot click-to-jump
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setActive(i);
    });
  });

  setup();
  mq.addEventListener('change', setup);
})();


  /* -----------------------------
     07) Privacy popup
  ----------------------------- */
  const initPrivacy = () => {
    const { privacyLink, privacyWrapper, privacyClose } = DOM;
    if (!privacyLink || !privacyWrapper) return;

    const show = () => { privacyWrapper.style.display = 'flex'; };
    const hide = () => { privacyWrapper.style.display = 'none'; };

    on(privacyLink, 'click', (e) => { e.preventDefault(); show(); });
    on(privacyClose, 'click', hide);
    on(privacyWrapper, 'click', (e) => { if (e.target === privacyWrapper) hide(); });
  };

  /* -----------------------------
     08) Survey (multi-step + shared progress bar)
     - Claims the top progress bar for survey while active
  ----------------------------- */
  const initSurvey = () => {
    const form = DOM.surveyForm;
    const bar = DOM.pageProgress;
    if (!form || !bar) return;

    const questions = $$('.question', form);
    if (!questions.length) return;

    let current = 0;
    const OPTIONAL_INDEXES = new Set([6]); // Q7 is optional (0-based index)

    // Mark the bar as survey-controlled to avoid conflict with scroll progress
    bar.classList.add(CONFIG.SURVEY_PROGRESS_CLASS);

    const showQuestion = (idx) => {
      questions.forEach((q, i) => q.classList.toggle('active', i === idx));
      const pct = (idx / questions.length) * 100;
      bar.style.width = `${pct}%`;
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

    // Next buttons with validation
    $$('.next-btn', form).forEach(btn => {
      on(btn, 'click', (e) => {
        e.preventDefault();
        const q = questions[current];
        const inputs = $$('input, textarea', q);

        let answered = false;
        inputs.forEach(inp => {
          if ((inp.type === 'radio' || inp.type === 'checkbox') && inp.checked) answered = true;
          if (inp.tagName === 'TEXTAREA' && inp.value.trim() !== '') answered = true;
          if (inp.type === 'email' && inp.value.trim() !== '') answered = true;
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
        if (current > 0) {
          current--;
          showQuestion(current);
        }
      });
    });
  };

  /* -----------------------------
     09) Page scroll progress bar
     - Auto-disables when survey is controlling it
  ----------------------------- */
  const initPageProgress = () => {
    const bar = DOM.pageProgress;
    if (!bar) return;

    const update = throttle(() => {
      // If survey has claimed the bar, don't overwrite it
      if (bar.classList.contains(CONFIG.SURVEY_PROGRESS_CLASS)) return;
      const scrolled = DOM.docEl.scrollTop || document.body.scrollTop;
      const height = DOM.docEl.scrollHeight - DOM.docEl.clientHeight;
      const pct = height > 0 ? (scrolled / height) * 100 : 0;
      bar.style.width = pct + '%';
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

    const step = () => Math.min(hiwCards.clientWidth * 0.9, 600);
    on(hiwLeft, 'click', () => hiwCards.scrollBy({ left: -step(), behavior: 'smooth' }));
    on(hiwRight, 'click', () => hiwCards.scrollBy({ left: step(), behavior: 'smooth' }));
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
        if (visible(launchRect) || visible(footerRect)) {
          stickyBanner.classList.remove('visible');
        } else {
          stickyBanner.classList.add('visible');
        }
        return;
      }

      if (!isHome) {
        stickyBanner.classList.add('visible');
        return;
      }

      const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
      if ((window.scrollY > heroBottom - 80 - buffer) && !visible(launchRect) && !visible(footerRect)) {
        stickyBanner.classList.add('visible');
      } else {
        stickyBanner.classList.remove('visible');
      }
    }, 80);

    // small delay to ensure layout is ready
    setTimeout(() => {
      handle();
      on(window, 'scroll', handle);
      on(window, 'resize', handle);
    }, 50);
  };

  /* -----------------------------
     12) FAQ accordion (single open)
  ----------------------------- */
  const initFAQ = () => {
    $$('.faq-question').forEach(btn => {
      on(btn, 'click', () => {
        const item = btn.parentElement;
        const wasActive = item.classList.contains('active');
        $$('.faq-item').forEach(i => i.classList.remove('active'));
        if (!wasActive) item.classList.add('active');
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
     14) Forms (timestamp, async POST, redirect)
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
        } catch (_) { /* ignore */ }

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

/* 16) Feature slider dots — build + sync */
/* Features slider dots: build, center-based activation, click-to-jump */
(function () {
  const track = document.getElementById('featuresTrack');
  const dotsWrap = document.getElementById('featuresDots');
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll('.feature'));
  if (!cards.length) return;

  dotsWrap.innerHTML = cards.map((_, i) =>
    `<button type="button" class="features-dot" aria-label="Go to feature ${i + 1}"></button>`
  ).join('');
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

  const throttle = (fn, wait=80)=>{ let t=0; return (...a)=>{ const n=Date.now(); if(n-t>=wait){ t=n; fn(...a);} }; };
  const syncActive = throttle(()=> setActive(getCenteredIndex()), 80);

  track.addEventListener('scroll', syncActive, { passive:true });
  window.addEventListener('resize', syncActive);

  // --- Force start at first card on mobile ---
  const spLeft = parseFloat(getComputedStyle(track).scrollPaddingLeft || '0');
  const snapFirst = () => {
    if (window.matchMedia('(max-width: 900px)').matches){
      // align the first card taking scroll-padding into account
      track.scrollTo({ left: cards[0].offsetLeft - spLeft, behavior: 'auto' });
      setActive(0);
    } else {
      track.scrollLeft = 0;
      setActive(0);
    }
  };
  // initial + iOS back-forward cache + orientation
  requestAnimationFrame(snapFirst);
  window.addEventListener('pageshow', snapFirst);
  window.addEventListener('orientationchange', () => setTimeout(snapFirst, 150));

  // Click a dot → scroll to that card
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const left = cards[i].offsetLeft - spLeft;
      track.scrollTo({ left, behavior: 'smooth' });
    });
  });
})();




  /* -----------------------------
     Init on DOM ready
  ----------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    initMobileNav();
    initSmoothScroll();
    initCountdown();
    initRipples();
    initFeaturesGrid();
    initPrivacy();
    initSurvey();         // claims top progress bar if survey present
    initPageProgress();   // uses top progress bar only if not claimed by survey
    initHIWArrows();
    initStickyCTA();
    initFAQ();
    initHeaderScroll();
    initForms();
    initShare();
  });

})();
