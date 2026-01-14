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

    function toggleMenu() {
        const isOpen = mobileMenu.classList.contains('translate-x-full');

        if (isOpen) {
            // Open
            mobileMenu.classList.remove('translate-x-full');
            document.body.classList.add('overflow-hidden');
        } else {
            // Close
            mobileMenu.classList.add('translate-x-full');
            document.body.classList.remove('overflow-hidden');
        }
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // 3. Navbar Scroll Effect (Floating Island V2) - REMOVED for Glass Nav V2.5
    /*
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-glass-strong', 'bg-white/90', 'py-2');
            navbar.classList.remove('py-4', 'bg-white/70');
        } else {
            navbar.classList.remove('shadow-glass-strong', 'bg-white/90', 'py-2');
            navbar.classList.add('py-4', 'bg-white/70');
        }
    });
    */

    // 4. Smooth Anchor Scrolling with View Transitions API
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === 'javascript:void(0)') return;

            e.preventDefault();

            // Close mobile menu if open
            if (!mobileMenu.classList.contains('translate-x-full')) {
                toggleMenu();
            }

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Use View Transition if available and preferred
                if (document.startViewTransition && !prefersReducedMotion) {
                    document.startViewTransition(() => {
                        targetElement.scrollIntoView({ behavior: 'auto' }); // Instant scroll inside transition
                    });
                } else {
                    // Fallback smooth scroll
                    targetElement.scrollIntoView({
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });
                }
            }
        });
    });

    // 5. Ambient Micro-Interaction (DISABLED by User Request for Static Stability)
    /*
    if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
        const logoContainer = document.querySelector('.logo-container');
        if (logoContainer) {
            document.addEventListener('mousemove', (e) => {
                const x = (window.innerWidth / 2 - e.pageX) / 50;
                const y = (window.innerHeight / 2 - e.pageY) / 50;

                requestAnimationFrame(() => {
                    logoContainer.style.transform = `translate(${x}px, ${y}px)`;
                });
            });
        }
    }
    */

    // 6. Particle Explosion & QR Reveal (Restored)
    const trigger = document.getElementById('follow-us-trigger');
    const canvas = document.getElementById('explosion-canvas');
    const qrPanel = document.getElementById('qr-code-panel');

    if (trigger && canvas && qrPanel) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        // Resize Canvas
        function resizeCanvas() {
            canvas.width = 800;
            canvas.height = 800; // Fixed size for consistent explosion area
        }
        resizeCanvas();

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 6 - 3;
                this.speedY = Math.random() * 6 - 3;
                this.color = `rgba(140, 21, 21, ${Math.random()})`; // Stanford Red
                this.life = 100;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= 2;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.life / 100;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        function createParticles() {
            // Explode from center 
            for (let i = 0; i < 60; i++) {
                particles.push(new Particle(canvas.width / 2, canvas.height / 2));
            }
            animateParticles();
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
            if (particles.length > 0) {
                animationId = requestAnimationFrame(animateParticles);
            }
        }

        // Interaction Logic
        // Hover -> Small explosion
        trigger.addEventListener('mouseenter', () => {
            if (!prefersReducedMotion) createParticles();
        });

        // Click -> Reveal QR Panel & Big Explosion
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate body click close

            // Toggle panel
            const isHidden = qrPanel.classList.contains('opacity-0');

            if (isHidden) {
                // Show
                qrPanel.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
                // Big Explosion
                createParticles();
                setTimeout(createParticles, 100);
                setTimeout(createParticles, 200);
            } else {
                // Hide
                qrPanel.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
            }
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!qrPanel.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
                qrPanel.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
            }
        });
    }
});
