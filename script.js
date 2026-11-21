/* ==========================================================================
   Sheikh Md. Tahmid Ullah — Academic Portfolio Interactions
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');
  var menuToggle = document.getElementById('menu-toggle');
  var primaryNav = document.getElementById('primary-nav');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.primary-nav .nav-link'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  var projectCards = Array.prototype.slice.call(document.querySelectorAll('.project-card'));
  var filterStatus = document.getElementById('filter-status');
  var certToggleBtn = document.getElementById('cert-toggle-btn');
  var extraCerts = Array.prototype.slice.call(document.querySelectorAll('.is-extra-cert'));
  var copyButtons = Array.prototype.slice.call(document.querySelectorAll('.copy-btn'));
  var toastEl = document.getElementById('copy-toast');
  var toastTimer = null;

  /* ------------------------------------------------------------------------
     1. Light / Dark Theme Toggle (persisted)
     ------------------------------------------------------------------------ */
  function syncThemeButton(theme) {
    if (!themeToggle) return;
    var isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  syncThemeButton(root.getAttribute('data-theme') || 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      syncThemeButton(next);
      try {
        localStorage.setItem('portfolio-theme', next);
      } catch (err) {
        /* ignore storage restrictions */
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. Mobile Navigation Drawer
     ------------------------------------------------------------------------ */
  function closeMenu() {
    if (!primaryNav || !menuToggle) return;
    primaryNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', function () {
      var willOpen = !primaryNav.classList.contains('is-open');
      primaryNav.classList.toggle('is-open', willOpen);
      menuToggle.setAttribute('aria-expanded', String(willOpen));
      menuToggle.setAttribute('aria-label', willOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. Active Section Highlight in Sticky Navigation
     ------------------------------------------------------------------------ */
  var sections = navLinks
    .map(function (link) {
      var href = link.getAttribute('href');
      return href && href.charAt(0) === '#' ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  function setActiveNav(sectionId) {
    navLinks.forEach(function (link) {
      var matches = link.getAttribute('href') === '#' + sectionId;
      link.classList.toggle('is-active', matches);
    });
  }

  if ('IntersectionObserver' in window && sections.length > 0) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-25% 0px -60% 0px',
        threshold: 0
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ------------------------------------------------------------------------
     4. Research Project Category Filtering
     ------------------------------------------------------------------------ */
  if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var selected = button.getAttribute('data-filter') || 'all';
        var visibleCount = 0;

        filterButtons.forEach(function (btn) {
          var isCurrent = btn === button;
          btn.classList.toggle('is-active', isCurrent);
          btn.setAttribute('aria-pressed', String(isCurrent));
        });

        projectCards.forEach(function (card) {
          var categories = (card.getAttribute('data-category') || '').split(/\s+/);
          var shouldShow = selected === 'all' || categories.indexOf(selected) !== -1;
          card.hidden = !shouldShow;
          if (shouldShow) {
            visibleCount += 1;
          }
        });

        if (filterStatus) {
          filterStatus.textContent =
            'Showing ' + visibleCount + ' of ' + projectCards.length + ' research projects.';
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. Collapsible Certifications & Workshops Toggle
     ------------------------------------------------------------------------ */
  if (certToggleBtn && extraCerts.length > 0) {
    certToggleBtn.addEventListener('click', function () {
      var isExpanded = certToggleBtn.getAttribute('aria-expanded') === 'true';
      var nextExpanded = !isExpanded;

      extraCerts.forEach(function (item) {
        item.hidden = !nextExpanded;
      });

      certToggleBtn.setAttribute('aria-expanded', String(nextExpanded));
      certToggleBtn.textContent = nextExpanded
        ? 'Show fewer trainings'
        : 'Show all 12 trainings & workshops';
    });
  }

  /* ------------------------------------------------------------------------
     6. Copy-to-Clipboard with Accessible Toast Feedback
     ------------------------------------------------------------------------ */
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      toastEl.hidden = true;
    }, 2400);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (ok) resolve();
        else reject(new Error('Copy command failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  copyButtons.forEach(function (button) {
    var defaultLabel = button.textContent.trim();
    button.addEventListener('click', function () {
      var payload = button.getAttribute('data-copy-text') || '';
      if (!payload) return;

      copyText(payload)
        .then(function () {
          button.textContent = 'Copied!';
          button.classList.add('is-copied');
          showToast('Copied to clipboard.');
          setTimeout(function () {
            button.textContent = defaultLabel;
            button.classList.remove('is-copied');
          }, 1800);
        })
        .catch(function () {
          showToast('Unable to copy automatically.');
        });
    });
  });
})();
