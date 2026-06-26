if (window.AOS) { AOS.init({ duration: 700, once: true, offset: 60, easing: 'ease-out-cubic' }); }

  // Sticky header shadow on scroll
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  });

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  // Animated counters for the "Why Choose Us" stats
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const decimal = el.getAttribute('data-decimal');
    const finalValue = decimal ? parseFloat(`${target}.${decimal}`) : target;
    const span = el.querySelector('span');
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = finalValue * eased;
      span.textContent = decimal ? current.toFixed(2) : Math.round(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => counterObserver.observe(c));

  // Contact form — sends to Node.js/Gmail backend
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = contactForm.querySelector('button[type="submit"]');

  // Toast notification
  function showToast(message, type = 'success') {
    const existing = document.getElementById('cm-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'cm-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed', top: '24px', right: '24px', zIndex: '9999',
      padding: '14px 20px', borderRadius: '10px', fontSize: '14px',
      fontWeight: '500', color: '#fff', maxWidth: '320px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      background: type === 'success' ? '#0A7EA4' : '#e53e3e',
      transform: 'translateX(120%)', transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    setTimeout(() => { toast.style.transform = 'translateX(120%)'; setTimeout(() => toast.remove(), 400); }, 4500);
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName       = document.getElementById('cf-name').value.trim();
    const email          = document.getElementById('cf-email').value.trim();
    const projectType    = document.getElementById('cf-subject').value;
    const projectDetails = document.getElementById('cf-message').value.trim();

    // Basic validation
    if (!fullName || !email || !projectDetails) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.style.opacity = '0.75';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, projectType, projectDetails })
      });

      const result = await response.json();

      if (result.success) {
        contactForm.style.display = 'none';
        formSuccess.classList.add('show');
      } else {
        showToast(result.message || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error. Make sure the server is running.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      submitBtn.style.opacity = '1';
    }
  });