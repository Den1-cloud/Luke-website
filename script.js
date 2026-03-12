/* ============================================================
   LUKE – script.js
   ============================================================ */

/* ---------- Scroll-reveal (Intersection Observer) ---------- */
const fadeEls = document.querySelectorAll('.fade-up');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
fadeEls.forEach((el) => revealObserver.observe(el));

/* ---------- Nav scroll glass effect ---------- */
const nav = document.getElementById('nav');
window.addEventListener(
  'scroll',
  () => nav.classList.toggle('scrolled', window.scrollY > 48),
  { passive: true }
);

/* ---------- Animated counter ---------- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const frameTime = 16;
  const totalFrames = duration / frameTime;
  let frame = 0;
  const timer = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.min(Math.floor(target * eased), target).toLocaleString();
    if (frame >= totalFrames) clearInterval(timer);
  }, frameTime);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll('.counter').forEach((el) => counterObserver.observe(el));

/* ---------- XP bar animate on scroll ---------- */
const xpFill = document.getElementById('xpFill');
if (xpFill) {
  const xpObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => { xpFill.style.width = '67%'; }, 350);
          xpObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  xpObserver.observe(xpFill);
}

/* ---------- Waitlist form handling ---------- */
function handleForm(formEl) {
  if (!formEl) return;
  const input = formEl.querySelector('.form-input');
  const btn   = formEl.querySelector('.btn');

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.classList.add('error');
      input.focus();
      setTimeout(() => input.classList.remove('error'), 1800);
      return;
    }

    // Success state
    input.disabled = true;
    btn.disabled   = true;
    btn.textContent = "✓ You're in!";
    btn.style.background = 'var(--emerald)';
    btn.style.color      = '#1d1838';

    // Persist (best-effort, no backend)
    try {
      const list = JSON.parse(localStorage.getItem('luke_waitlist') || '[]');
      if (!list.includes(email)) {
        list.push(email);
        localStorage.setItem('luke_waitlist', JSON.stringify(list));
      }
    } catch (_) {}

    showToast();
  });
}

handleForm(document.getElementById('hero-form'));
handleForm(document.getElementById('cta-form'));

/* ---------- Toast ---------- */
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4200);
}

/* ---------- Legal Modals ---------- */
function setupModal(btnId, modalId) {
  const btn     = document.getElementById(btnId);
  const modal   = document.getElementById(modalId);
  if (!btn || !modal) return;

  const backdrop = modal.querySelector('.modal-backdrop');
  const closeBtn = modal.querySelector('.modal-close');

  function open(e) {
    e && e.preventDefault();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    btn.focus();
  }

  btn.addEventListener('click', open);
  backdrop.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

setupModal('btn-terms',   'modal-terms');
setupModal('btn-privacy', 'modal-privacy');
setupModal('btn-imprint', 'modal-imprint');

/* ---------- Smooth scroll for internal nav links ---------- */
document.querySelectorAll('.js-scroll, [href="#waitlist"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---------- Center the middle mockup on load (mobile) ---------- */
(function centerMockups() {
  const scroll = document.querySelector('.mockups-scroll');
  const center = scroll && scroll.querySelector('.center-mockup');
  if (!scroll || !center) return;

  // Wait for layout
  requestAnimationFrame(() => {
    const scrollMid  = scroll.scrollLeft + scroll.offsetWidth / 2;
    const cardMid    = center.offsetLeft + center.offsetWidth / 2;
    scroll.scrollLeft += cardMid - scrollMid;
  });
})();
