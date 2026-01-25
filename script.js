/**
 * SHIV SECURITY - Parallax & Interactions
 * Minimal JS for smooth performance
 */

(function() {
  'use strict';

  // ========================================
  // CONFIGURATION
  // ========================================
  
  const CONFIG = {
    parallax: {
      enabled: true,
      smoothing: 0.1, // Lower = smoother, slower response
      bounds: 30      // Max movement in pixels
    },
    layers: {
      clouds: { speed: 0.08, maxMove: 40 },
      bgMountains: { speed: 0.02, maxMove: 15 },
      frontMountains: { speed: 0.03, maxMove: 20 },
      shiva: { speed: 0.015, maxMove: 15 }
    }
  };

  // ========================================
  // STATE
  // ========================================
  
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let animationId = null;
  let isVisible = true;

  // ========================================
  // DOM ELEMENTS
  // ========================================
  
  const layers = {
    clouds: document.querySelector('.layer-clouds'),
    bgMountains: document.querySelector('.layer-bg-mountains'),
    frontMountains: document.querySelector('.layer-front-mountains'),
    shiva: document.querySelector('.layer-shiva')
  };

  const hero = document.querySelector('.hero');

  // ========================================
  // PARALLAX SYSTEM
  // ========================================

  function initParallax() {
    if (!CONFIG.parallax.enabled) return;

    // Mouse move handler
    document.addEventListener('mousemove', onMouseMove, { passive: true });

    // Touch support for mobile
    document.addEventListener('touchmove', onTouchMove, { passive: true });

    // Visibility API - pause when tab not visible
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Start animation loop
    animate();
  }

  function onMouseMove(e) {
    // Normalize mouse position to -1 to 1
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      mouseX = (touch.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (touch.clientY / window.innerHeight - 0.5) * 2;
    }
  }

  function onVisibilityChange() {
    isVisible = !document.hidden;
    if (isVisible && !animationId) {
      animate();
    }
  }

  function animate() {
    if (!isVisible) {
      animationId = null;
      return;
    }

    // Smooth interpolation
    currentX += (mouseX - currentX) * CONFIG.parallax.smoothing;
    currentY += (mouseY - currentY) * CONFIG.parallax.smoothing;

    // Apply transforms to layers
    applyParallax();

    animationId = requestAnimationFrame(animate);
  }

  function applyParallax() {
    Object.keys(layers).forEach(key => {
      const layer = layers[key];
      const settings = CONFIG.layers[key];
      
      if (!layer || !settings) return;

      const moveX = currentX * settings.maxMove;
      const moveY = currentY * settings.maxMove * 0.5; // Less vertical movement

      // Use transform for GPU acceleration
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  }

  // ========================================
  // SCROLL EFFECTS
  // ========================================

  function initScrollEffects() {
    let ticking = false;

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function onScroll() {
    const scrollY = window.scrollY;
    const heroHeight = hero ? hero.offsetHeight : window.innerHeight;
    const scrollPercent = Math.min(scrollY / heroHeight, 1);

    // Only fade out Shiva on scroll (no transform to avoid conflict with parallax)
    if (layers.shiva && scrollY < heroHeight) {
      const opacity = 1 - scrollPercent * 1.2;
      layers.shiva.style.opacity = Math.max(0, opacity);
    }

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
      } else {
        navbar.style.background = 'linear-gradient(180deg, rgba(10, 10, 10, 0.9) 0%, transparent 100%)';
        navbar.style.backdropFilter = 'none';
      }
    }
  }

  // ========================================
  // BUTTON INTERACTIONS
  // ========================================

  function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn, .nav-cta, .service-link');

    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', function(e) {
        this.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });

      btn.addEventListener('mouseleave', function(e) {
        this.style.transition = 'all 0.3s ease';
      });
    });
  }

  // ========================================
  // NAVIGATION
  // ========================================

  function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Desktop nav links - smooth scroll
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        smoothScrollTo(targetId);
        updateActiveNav(link, navLinks);
      });
    });

    // Mobile nav links
    mobileLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        closeMobileMenu(mobileMenuBtn, mobileMenu);
        setTimeout(() => {
          smoothScrollTo(targetId);
        }, 300);
      });
    });

    // Mobile menu toggle
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        toggleMobileMenu(mobileMenuBtn, mobileMenu);
      });
    }

    // Scroll spy for active nav
    window.addEventListener('scroll', () => {
      updateNavOnScroll(navLinks, navbar);
    }, { passive: true });
  }

  function smoothScrollTo(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
      const navHeight = 80;
      const targetPosition = target.offsetTop - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  function updateActiveNav(activeLink, allLinks) {
    allLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
  }

  function updateNavOnScroll(navLinks, navbar) {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY;
    const navHeight = 80;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - navHeight - 100;
      const sectionBottom = sectionTop + section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });

    // Navbar background on scroll
    if (navbar) {
      if (scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
      } else {
        navbar.style.background = 'linear-gradient(180deg, rgba(10, 10, 10, 0.9) 0%, transparent 100%)';
        navbar.style.backdropFilter = 'none';
        navbar.style.boxShadow = 'none';
      }
    }
  }

  function toggleMobileMenu(btn, menu) {
    btn.classList.toggle('active');
    menu.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
  }

  function closeMobileMenu(btn, menu) {
    if (btn) btn.classList.remove('active');
    if (menu) menu.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ========================================
  // CONTACT FORM
  // ========================================

  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const successModal = document.getElementById('successModal');

    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Basic validation
      if (!data.name || !data.email || !data.phone) {
        alert('Please fill in all required fields.');
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Simulate form submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = '<span>Sending...</span>';
      submitBtn.disabled = true;

      setTimeout(() => {
        // Show success modal
        if (successModal) {
          successModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
        
        // Reset form
        contactForm.reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        console.log('Form submitted:', data);
      }, 1500);
    });

    // Close modal on backdrop click
    if (successModal) {
      successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
          closeModal();
        }
      });
    }

    // Global close function
    window.closeModal = function() {
      if (successModal) {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    };
  }

  // ========================================
  // SCROLL ANIMATIONS
  // ========================================

  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-card, .feature-item, .step, .career-card, .contact-item');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
      });
    }
  }

  // ========================================
  // KEYBOARD NAVIGATION
  // ========================================

  function initKeyboardNav() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu(mobileMenuBtn, mobileMenu);
        if (typeof closeModal === 'function') closeModal();
      }
    });
  }

  // ========================================
  // PRELOADER / INITIAL ANIMATION
  // ========================================

  function initLoadSequence() {
    window.addEventListener('load', function() {
      document.body.classList.add('loaded');
      console.log('🛡️ Shiv Security - Website Loaded');
      console.log('⚡ All systems operational');
    });
  }

  // ========================================
  // REDUCED MOTION SUPPORT
  // ========================================

  function checkReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (mediaQuery.matches) {
      CONFIG.parallax.enabled = false;
      
      // Stop cloud animation
      const cloudsTrack = document.querySelector('.clouds-track');
      if (cloudsTrack) {
        cloudsTrack.style.animation = 'none';
      }
    }
  }

  // ========================================
  // PERFORMANCE OPTIMIZATION
  // ========================================

  function optimizeForDevice() {
    // Detect low-end devices
    const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                     navigator.deviceMemory <= 2;

    if (isLowEnd) {
      CONFIG.parallax.smoothing = 0.05; // Slower updates
      CONFIG.parallax.bounds = 15;       // Less movement
      
      // Reduce layer movement
      Object.keys(CONFIG.layers).forEach(key => {
        CONFIG.layers[key].maxMove *= 0.5;
      });
    }

    // Disable parallax on touch devices for better performance
    if ('ontouchstart' in window && window.innerWidth < 1024) {
      CONFIG.parallax.enabled = false;
    }
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  function init() {
    checkReducedMotion();
    optimizeForDevice();
    initParallax();
    initScrollEffects();
    initButtonEffects();
    initNavigation();
    initContactForm();
    initScrollAnimations();
    initKeyboardNav();
    initLoadSequence();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
