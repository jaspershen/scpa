// SCPA Main JavaScript - V2 Patch (View Transitions & Ambient)

document.addEventListener('DOMContentLoaded', () => {

    // 0. Prefers Reduced Motion Check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scroll Reveal Animation (IntersectionObserver)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up').forEach(el => {
        if (prefersReducedMotion) {
            el.style.opacity = '1';
            el.style.transform = 'none';
        } else {
            revealObserver.observe(el);
        }
    });

    // 2. Mobile Menu Logic with Backdrop Blur
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    function updateMobileMenuButton(isExpanded) {
        if (!menuBtn) return;
        const isChinese = document.documentElement.lang.startsWith('zh');
        menuBtn.setAttribute('aria-expanded', String(isExpanded));
        menuBtn.setAttribute('aria-label', isExpanded
            ? (isChinese ? '关闭导航菜单' : 'Close navigation menu')
            : (isChinese ? '打开导航菜单' : 'Open navigation menu'));
    }

    function toggleMenu() {
        const isOpen = mobileMenu.classList.contains('translate-x-full');

        if (isOpen) {
            // Open
            mobileMenu.classList.remove('translate-x-full');
            mobileMenu.removeAttribute('inert');
            mobileMenu.setAttribute('aria-hidden', 'false');
            document.body.classList.add('overflow-hidden');
            updateMobileMenuButton(true);
            if (closeBtn) closeBtn.focus();
        } else {
            // Close
            mobileMenu.classList.add('translate-x-full');
            mobileMenu.setAttribute('inert', '');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('overflow-hidden');
            updateMobileMenuButton(false);
            if (menuBtn) menuBtn.focus();
        }
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    document.addEventListener('keydown', (event) => {
        const menuIsOpen = mobileMenu && !mobileMenu.classList.contains('translate-x-full');

        if (event.key === 'Escape' && menuIsOpen) {
            toggleMenu();
            return;
        }

        if (event.key === 'Tab' && menuIsOpen) {
            const focusable = Array.from(mobileMenu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (!first || !last) return;
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    const desktopMenuBreakpoint = window.matchMedia('(min-width: 768px)');
    desktopMenuBreakpoint.addEventListener('change', (event) => {
        if (!event.matches || !mobileMenu || mobileMenu.classList.contains('translate-x-full')) return;
        mobileMenu.classList.add('translate-x-full');
        mobileMenu.setAttribute('inert', '');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('overflow-hidden');
        updateMobileMenuButton(false);
    });

    // 3. Navbar Scroll Effect - Dynamic Stanford Red (Gradual Transition)
    const navbar = document.getElementById('siteNav');
    const navItems = document.querySelectorAll('.navlink');

    if (navbar) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const threshold = 400; // Pixels to reach full opacity
            const maxOpacity = 0.92; // Deep rich red

            // Calculate opacity based on scroll (0 to 1)
            let scrollRatio = Math.min(scrollY / threshold, 1);
            let opacity = scrollRatio * maxOpacity;

            // Apply calculated Stanford Red background
            navbar.style.backgroundColor = `rgba(140, 21, 21, ${opacity})`;

            // Change link colors for contrast
            if (scrollY > 100) {
                navItems.forEach(link => {
                    link.style.color = '#FAFAF8'; // Ivory/White
                });
            } else {
                navItems.forEach(link => {
                    link.style.color = ''; // Reset to default
                });
            }

            // Dynamic Blur & Shadow for depth
            if (scrollY > 10) {
                const blurAmount = Math.min(scrollY / 20, 16);
                navbar.style.backdropFilter = `blur(${blurAmount}px)`;
                navbar.style.webkitBackdropFilter = `blur(${blurAmount}px)`;
                navbar.style.boxShadow = `0 10px 40px -10px rgba(0, 0, 0, ${scrollRatio * 0.3})`;
            } else {
                navbar.style.backdropFilter = 'none';
                navbar.style.webkitBackdropFilter = 'none';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // 4. Smooth Anchor Scrolling with View Transitions API
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === 'javascript:void(0)') return;

            e.preventDefault();

            if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
                toggleMenu();
            }

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                if (document.startViewTransition && !prefersReducedMotion) {
                    document.startViewTransition(() => {
                        targetElement.scrollIntoView({ behavior: 'auto' });
                    });
                } else {
                    targetElement.scrollIntoView({
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });
                }
            }
        });
    });

    // 5. 'Italian Electronic Art' Particle Explosion & QR Reveal
    const trigger = document.getElementById('followBtn');
    const canvas = document.getElementById('explosion-canvas');
    const qrPanel = document.getElementById('follow-us-overlay');
    const closeFollowPanel = document.getElementById('close-follow-panel');

    if (trigger && canvas && qrPanel) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '60';
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class ElectronicParticle {
            constructor(x, y, type = 'circle') {
                this.x = x;
                this.y = y;
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * 25 + 10;
                this.vx = Math.cos(angle) * velocity;
                this.vy = Math.sin(angle) * velocity;
                this.friction = 0.94;
                this.gravity = 0.6;
                this.size = Math.random() * 5 + 2;
                this.life = 1;
                this.decay = Math.random() * 0.02 + 0.01;
                this.type = type;
                const colors = ['140, 21, 21', '200, 30, 30', '255, 255, 255', '210, 194, 149', '255, 215, 0'];
                this.rgb = colors[Math.floor(Math.random() * colors.length)];
            }
            update() {
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.life -= this.decay;
                if (Math.random() < 0.05) this.x += (Math.random() - 0.5) * 15;
            }
            draw() {
                ctx.fillStyle = `rgba(${this.rgb}, ${this.life})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${this.rgb}, 0.5)`;
                if (this.type === 'circle') {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(this.x, this.y, this.size * 1.5, this.size * 1.5);
                }
                ctx.shadowBlur = 0;
            }
        }

        function createExplosion(x, y) {
            const burstCount = 200;
            for (let i = 0; i < burstCount; i++) {
                const type = Math.random() > 0.6 ? 'square' : 'circle';
                particles.push(new ElectronicParticle(x, y, type));
            }
            if (!animationId) animate();
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.update();
                p.draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 60 && p.life > 0.5 && p2.life > 0.5) {
                        ctx.strokeStyle = `rgba(140, 21, 21, ${0.15 * p.life})`;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
            if (particles.length > 0) animationId = requestAnimationFrame(animate);
            else animationId = null;
        }

        function hideQrPanel() {
            qrPanel.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
            qrPanel.setAttribute('inert', '');
            qrPanel.setAttribute('aria-hidden', 'true');
            trigger.setAttribute('aria-expanded', 'false');
        }

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = trigger.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const isHidden = qrPanel.classList.contains('opacity-0');
            if (isHidden) {
                qrPanel.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
                qrPanel.removeAttribute('inert');
                qrPanel.setAttribute('aria-hidden', 'false');
                trigger.setAttribute('aria-expanded', 'true');
                createExplosion(centerX, centerY);
                setTimeout(() => createExplosion(centerX, centerY), 150);
            } else {
                hideQrPanel();
            }
        });

        if (closeFollowPanel) {
            closeFollowPanel.addEventListener('click', (e) => {
                e.stopPropagation();
                hideQrPanel();
                trigger.focus();
            });
        }

        document.addEventListener('click', (e) => {
            if (!qrPanel.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
                hideQrPanel();
            }
        });
    }

    // 6. Bilingual Language Toggle
    const langToggle = document.getElementById('langToggle');
    const langToggleMobile = document.getElementById('langToggleMobile');
    const langToggles = [langToggle, langToggleMobile].filter(Boolean);
    const langElements = document.querySelectorAll('[data-en][data-zh]');

    function setLanguage(lang) {
        langElements.forEach(el => {
            const translation = el.getAttribute(`data-${lang}`);
            if (translation) {
                el.textContent = translation;
            }
        });
        langToggles.forEach(toggle => {
            toggle.textContent = lang === 'en' ? '中文' : 'EN';
            toggle.setAttribute('aria-label', lang === 'en' ? '切换至中文' : 'Switch to English');
        });
        document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
        updateMobileMenuButton(menuBtn?.getAttribute('aria-expanded') === 'true');
        if (closeFollowPanel) {
            closeFollowPanel.setAttribute('aria-label', lang === 'en' ? 'Close follow panel' : '关闭关注面板');
        }
        localStorage.setItem('scpa_lang', lang);
    }

    langToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const currentLang = localStorage.getItem('scpa_lang') || 'en';
            const newLang = currentLang === 'en' ? 'zh' : 'en';
            setLanguage(newLang);
        });
    });

    const savedLang = localStorage.getItem('scpa_lang') || 'en';
    setLanguage(savedLang);
});
