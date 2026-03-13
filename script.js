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
 
/* ---------- Nav: switch to light mode when past hero ---------- */
const nav = document.getElementById('nav');
function updateNavMode() {
  const hero = document.getElementById('hero');
  const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
  nav.classList.toggle('scrolled-light', heroBottom < 80);
}
window.addEventListener('scroll', () => requestAnimationFrame(updateNavMode), { passive: true });
updateNavMode();
 
/* ---------- Animated counter ---------- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (!target) return;
  const duration = 2000;
  const frameTime = 16;
  const totalFrames = duration / frameTime;
  let frame = 0;
  const timer = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.min(Math.floor(target * eased), target).toLocaleString();
    if (frame >= totalFrames) clearInterval(timer);
  }, frameTime);
}
 
/* ---------- Live counter from Brevo (starts observer after fetch) ---------- */
async function initCounter() {
  let count = 0;
  try {
    const response = await fetch('/api/counter');
    const data = await response.json();
    count = data.count || 0;
  } catch (_) {}
 
  document.querySelectorAll('.counter').forEach(el => {
    el.dataset.target = count;
  });
 
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
}
initCounter();
 
/* ---------- Poll counter every 30s for real-time updates ---------- */
setInterval(async () => {
  try {
    const response = await fetch('/api/counter');
    const data = await response.json();
    const newCount = data.count || 0;
    document.querySelectorAll('.counter').forEach(el => {
      const current = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 0;
      if (newCount > current) {
        el.dataset.target = newCount;
        const duration = 600;
        const frameTime = 16;
        const totalFrames = duration / frameTime;
        let frame = 0;
        const timer = setInterval(() => {
          frame++;
          const eased = 1 - Math.pow(1 - frame / totalFrames, 3);
          el.textContent = Math.round(current + (newCount - current) * eased).toLocaleString();
          if (frame >= totalFrames) {
            el.textContent = newCount.toLocaleString();
            clearInterval(timer);
          }
        }, frameTime);
      }
    });
  } catch (_) {}
}, 30000);
 
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
 
    // Send to Brevo + update counter immediately
    fetch('/api/counter', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email })
    }).then(() => {
      document.querySelectorAll('.counter').forEach(el => {
        const current = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 0;
        const newTarget = current + 1;
        el.dataset.target = newTarget;
        const duration = 600;
        const frameTime = 16;
        const totalFrames = duration / frameTime;
        let frame = 0;
        const timer = setInterval(() => {
          frame++;
          const progress = frame / totalFrames;
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(current + eased).toLocaleString();
          if (frame >= totalFrames) {
            el.textContent = newTarget.toLocaleString();
            clearInterval(timer);
          }
        }, frameTime);
      });
    });
 
    showToast();
  });
}
 
handleForm(document.getElementById('hero-form'));
 
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
 
/* ---------- FAQ Accordion (single-open, scrollHeight-based) ---------- */
const faqItems = document.querySelectorAll('.faq-item');
 
function closeFaqItem(item) {
  const a = item.querySelector('.faq-a');
  a.style.maxHeight = a.scrollHeight + 'px';
  a.style.opacity   = '1';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      a.style.maxHeight = '0';
      a.style.opacity   = '0';
    });
  });
  item.classList.remove('open');
  item.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
}
 
function openFaqItem(item) {
  const a = item.querySelector('.faq-a');
  item.classList.add('open');
  item.querySelector('.faq-q').setAttribute('aria-expanded', 'true');
  a.style.maxHeight = a.scrollHeight + 'px';
  a.style.opacity   = '1';
}
 
faqItems.forEach((item) => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    faqItems.forEach((i) => { if (i !== item) closeFaqItem(i); });
    isOpen ? closeFaqItem(item) : openFaqItem(item);
  });
});
 
/* ---------- Smooth scroll — easeInOutCubic, 1200ms, 80px nav offset ---------- */
function smoothScrollTo(target) {
  const element = document.querySelector(target);
  if (!element) return;
  const navHeight = 80;
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - navHeight;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = 1200;
  let start = null;
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function animation(currentTime) {
    if (!start) start = currentTime;
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(animation);
  }
  requestAnimationFrame(animation);
}
 
document.querySelectorAll('.js-scroll').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    smoothScrollTo(href);
  });
});
 
/* ---------- Center the middle mockup on load (mobile) ---------- */
(function centerMockups() {
  const scroll = document.querySelector('.mockups-scroll');
  const center = scroll && scroll.querySelector('.center-mockup');
  if (!scroll || !center) return;
 
  requestAnimationFrame(() => {
    const scrollMid  = scroll.scrollLeft + scroll.offsetWidth / 2;
    const cardMid    = center.offsetLeft + center.offsetWidth / 2;
    scroll.scrollLeft += cardMid - scrollMid;
  });
})();
 