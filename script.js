document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------
  // 1. Fade-in Animations
  // ----------------------------
  const animateElements = document.querySelectorAll("[data-animate]");
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    },
    { threshold: 0.1 }
  );
  animateElements.forEach(el => observer.observe(el));

  // ----------------------------
  // 2. Drop down top right for mobile
  // ----------------------------
const toggleBtn = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');
let isAnimating = false;

if (toggleBtn && mobileMenu) {
  function openMenu() {
    if (isAnimating) return;
    isAnimating = true;
    mobileMenu.style.display = 'flex';
    document.body.classList.add('nav-open');
    requestAnimationFrame(() => {
      mobileMenu.classList.add('open');
      toggleBtn.classList.add('open');
      isAnimating = false;
    });
  }

  function closeMenu() {
    if (isAnimating) return;
    isAnimating = true;
    mobileMenu.classList.remove('open');
    toggleBtn.classList.remove('open');
    document.body.classList.remove('nav-open');
    // Wait for transition to finish before hiding
    const onTransitionEnd = () => {
      mobileMenu.style.display = 'none';
      mobileMenu.removeEventListener('transitionend', onTransitionEnd);
      isAnimating = false;
    };
    mobileMenu.addEventListener('transitionend', onTransitionEnd);
  }

  toggleBtn.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking a nav link
  document.querySelectorAll('.mobile-nav-overlay a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}
                        
  // ----------------------------
  // 3. Countdown Timer
  // ----------------------------
  const countdownEl = document.getElementById("countdown-timer");

const launchDate = new Date("2026-05-01T00:00:00");

function updateCountdown() {
  const now = new Date();

  if (!countdownEl) return;

  if (now >= launchDate) {
    countdownEl.textContent = "We're live!";
    return;
  }

  const months =
    (launchDate.getFullYear() - now.getFullYear()) * 12 +
    (launchDate.getMonth() - now.getMonth()) -
    (now.getDate() > launchDate.getDate() ? 1 : 0);

  countdownEl.textContent = `Launching in: ${months} month${months !== 1 ? "s" : ""}`;
}

if (countdownEl) {
  updateCountdown();
  setInterval(updateCountdown, 3600000); // every hour
}

  // ----------------------------
  // 4. Smooth Scrolling
  // ----------------------------
// ----------------------------
// 4. Smooth Scrolling (with overscroll prevention)
// ----------------------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const id = this.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;

    const offset = 45; // Match your fixed nav height
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - offset;

    const currentScroll = window.pageYOffset;
    const difference = Math.abs(currentScroll - targetTop);

    // Prevent scrolling if we're already very close to the target
    if (difference < 5) return;

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });
  });
});






  // ----------------------------
  // 5. Ripple Button Effect
  // ----------------------------
  document.querySelectorAll(".cta-button, .inline-email-form button").forEach(button => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      ripple.classList.add("ripple");
      const rect = this.getBoundingClientRect();
      ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
      ripple.style.left = `${e.clientX - rect.left - rect.width / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - rect.height / 2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ----------------------------
  // 6. Swipeable Features on Mobile
  // ----------------------------
  const featureGrid = document.querySelector(".features-grid");
 if (featureGrid) {
  if (window.innerWidth < 768) {
    featureGrid.style.overflowX = "auto";
    featureGrid.style.display = "flex";
    featureGrid.style.flexWrap = "nowrap";
    featureGrid.style.scrollSnapType = "x mandatory";
    featureGrid.querySelectorAll(".feature").forEach(card => {
      card.style.flex = "0 0 80%";
      card.style.scrollSnapAlign = "start";
    });
  } else {
    // Reset styles for desktop view
    featureGrid.style.display = "";
    featureGrid.style.overflowX = "";
    featureGrid.style.flexWrap = "";
    featureGrid.style.scrollSnapType = "";
    featureGrid.querySelectorAll(".feature").forEach(card => {
      card.style.flex = "";
      card.style.scrollSnapAlign = "";
    });
  }
}

  // ----------------------------
  // 7. Privacy Popup
  // ----------------------------
  const privacyLink = document.querySelector(".privacy-link");
  const popupWrapper = document.querySelector(".privacy-popup-wrapper");
  const closePrivacyBtn = document.querySelector(".close-btn");
  let hoverTimer;
  function showPopup() {
    popupWrapper.style.display = "flex";
  }
  function hidePopup() {
    popupWrapper.style.display = "none";
  }
  if (privacyLink && popupWrapper) {
    privacyLink.addEventListener("mouseenter", () => {
      hoverTimer = setTimeout(showPopup, 500);
    });
    privacyLink.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimer);
    });
    popupWrapper.addEventListener("mouseenter", () => clearTimeout(hoverTimer));
    popupWrapper.addEventListener("mouseleave", hidePopup);
    privacyLink.addEventListener("click", e => {
      e.preventDefault();
      showPopup();
    });
    if (closePrivacyBtn) closePrivacyBtn.addEventListener("click", hidePopup);
  }

  // ----------------------------
  // 8. Survey Logic
  // ----------------------------
  const questions = Array.from(document.querySelectorAll(".question"));
  const nextBtns = document.querySelectorAll(".next-btn");
  const backBtns = document.querySelectorAll(".back-btn");
  const progressBar = document.getElementById("progressBar");
  let current = 0;

  function showQuestion(index) {
    questions.forEach((q, i) => q.classList.toggle("active", i === index));
    updateProgressBar(index);
  }

  function updateProgressBar(index) {
  if (progressBar) {
    const percent = (index / questions.length) * 100;
    progressBar.style.width = `${percent}%`;
  }
}

  showQuestion(current);

  document.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener("change", () => {
      const parentQuestion = input.closest(".question");
      const inputs = parentQuestion.querySelectorAll("input[type='radio']");
      const isAnswered = Array.from(inputs).some(radio => radio.checked);
      if (isAnswered && current < questions.length - 1) {
        current++;
        showQuestion(current);
      }
    });
  });

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const currentQuestion = questions[current];
      const inputs = currentQuestion.querySelectorAll("input, textarea");
      let isAnswered = false;
      inputs.forEach(input => {
        if ((input.type === "radio" || input.type === "checkbox") && input.checked) {
          isAnswered = true;
        }
        if (input.tagName === "TEXTAREA" && input.value.trim() !== "") {
          isAnswered = true;
        }
        if (input.type === "email" && input.value.trim() !== "") {
          isAnswered = true;
        }
      });
      if (!isAnswered) {
        alert("Please select or enter an answer before continuing.");
        return;
      }
      if (current < questions.length - 1) {
        current++;
        showQuestion(current);
      }
    });
  });

  backBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (current > 0) {
        current--;
        showQuestion(current);
      }
    });
  });

  // ----------------------------
  // 9. Remove focus on nav link click
  // ----------------------------
  document.querySelectorAll('.site-nav a').forEach(link => {
    link.addEventListener('click', function () {
      this.blur();
    });
  });
});

 // 10. Mobile-only HIW scroll arrows
const hiwScrollLeft = document.querySelector('.hiw-arrow-left');
const hiwScrollRight = document.querySelector('.hiw-arrow-right');
const hiwContainer = document.querySelector('.hiw-cards');

function scrollHIW(direction) {
  if (!hiwContainer) return;
  const amount = hiwContainer.offsetWidth * 0.85;
  hiwContainer.scrollBy({
    left: direction * amount,
    behavior: 'smooth'
  });
}

if (hiwScrollLeft) {
  hiwScrollLeft.addEventListener('click', () => scrollHIW(-1));
}
if (hiwScrollRight) {
  hiwScrollRight.addEventListener('click', () => scrollHIW(1));
}

// ----------------------------
// 11. Sticky bar slide up
// ----------------------------

document.addEventListener("DOMContentLoaded", () => {
  const stickyBanner = document.querySelector('.sticky-cta-banner');
  const heroSection = document.querySelector('.hero');
  const launchSection = document.querySelector('.signup-section');
  const footer = document.querySelector('footer');

  if (!stickyBanner || !heroSection) return;

  // Detect current page — adjust if your launch page isn't "/"
  const isHomePage = window.location.pathname === "/" || window.location.pathname === "/index.html";
  const isMobile = window.innerWidth <= 767;

  function handleStickyBanner() {
    // Mobile: always show unless launch form or footer is visible
    if (isMobile) {
      const launchRect = launchSection?.getBoundingClientRect();
      const footerRect = footer?.getBoundingClientRect();
      const launchVisible = launchRect && launchRect.top < window.innerHeight && launchRect.bottom > 0;
      const footerVisible = footerRect && footerRect.top < window.innerHeight && footerRect.bottom > 0;

      if (launchVisible || footerVisible) {
        stickyBanner.classList.remove('visible');
      } else {
        stickyBanner.classList.add('visible');
      }
      return;
    }

    // Desktop: show only if not on launch page, or scrolled past hero
    if (!isHomePage) {
      stickyBanner.classList.add('visible');
      return;
    }

    const launchRect = launchSection?.getBoundingClientRect();
    const footerRect = footer?.getBoundingClientRect();
    const launchVisible = launchRect && launchRect.top < window.innerHeight && launchRect.bottom > 0;
    const footerVisible = footerRect && footerRect.top < window.innerHeight && footerRect.bottom > 0;

    const heroBottom = heroSection.getBoundingClientRect().bottom + window.scrollY;

    if ((window.scrollY > heroBottom - 80) && !launchVisible && !footerVisible) {
      stickyBanner.classList.add('visible');
    } else {
      stickyBanner.classList.remove('visible');
    }
  }

  // Run after short delay to avoid flash
  setTimeout(() => {
    handleStickyBanner();
    window.addEventListener('scroll', handleStickyBanner);
    window.addEventListener('resize', handleStickyBanner);
  }, 50);
});

// ----------------------------
// 12. FAQ drop down
// --------

document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    const wasActive = faqItem.classList.contains('active');

    // Close all
    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
    });

    // Open clicked one if it wasn't already active
    if (!wasActive) {
      faqItem.classList.add('active');
    }
  });
});






