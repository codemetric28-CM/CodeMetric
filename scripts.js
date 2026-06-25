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

  // Contact form (front-end only demo — wire up to your backend / form service)
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    contactForm.style.display = 'none';
    formSuccess.classList.add('show');
  });