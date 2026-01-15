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

    // 3. Navbar Scroll Effect - Dynamic Stanford Red (Gradual Transition)
    const navbar = document.getElementById('siteNav');

    if (navbar) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const threshold = 400; // Pixels to reach full opacity
            const maxOpacity = 0.92; // Deep rich red

            // Calculate opacity based on scroll (0 to 1)
            let scrollRatio = Math.min(scrollY / threshold, 1);
            let opacity = scrollRatio * maxOpacity;

            // Apply calculated Stanford Red background
            // RGB: 140, 21, 21 (#8C1515)
            navbar.style.backgroundColor = `rgba(140, 21, 21, ${opacity})`;

            // Dynamic Blur & Shadow for depth
            if (scrollY > 10) {
                // Increase blur as we scroll
                const blurAmount = Math.min(scrollY / 20, 16);
                navbar.style.backdropFilter = `blur(${blurAmount}px)`;
                navbar.style.webkitBackdropFilter = `blur(${blurAmount}px)`;

                // Add shadow
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

    // 6. 'Italian Electronic Art' Particle Explosion & QR Reveal
    const trigger = document.getElementById('followBtn');
    const canvas = document.getElementById('explosion-canvas');
    const qrPanel = document.getElementById('follow-us-overlay');

    if (trigger && canvas && qrPanel) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        // Resize Canvas to cover full window for maximum drama
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.pointerEvents = 'none'; // Click-through
            canvas.style.zIndex = '60'; // Above overlay content for initial pop
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class ElectronicParticle {
            constructor(x, y, type = 'circle') {
                this.x = x;
                this.y = y;
                // High velocity for initial "Bang"
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * 25 + 10; // Much Faster!

                this.vx = Math.cos(angle) * velocity;
                this.vy = Math.sin(angle) * velocity;

                this.friction = 0.94; // Glossy air resistance
                this.gravity = 0.6;

                this.size = Math.random() * 5 + 2;
                this.life = 1; // Alpha value
                this.decay = Math.random() * 0.02 + 0.01;

                this.type = type; // 'circle' or 'square' (digital datum)

                // Palette: Stanford Red, Deep Red, White, Gold, Electric Pulse
                const colors = [
                    '140, 21, 21',   // Stanford Red
                    '200, 30, 30',   // Bright Red
                    '255, 255, 255', // White
                    '210, 194, 149',  // Gold-ish
                    '255, 215, 0'     // Pure Gold spark
                ];
                this.rgb = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.vy += this.gravity;

                this.x += this.vx;
                this.y += this.vy;
                this.life -= this.decay;

                // Digital glitch movement occasionally
                if (Math.random() < 0.05) {
                    this.x += (Math.random() - 0.5) * 15;
                }
            }

            draw() {
                ctx.fillStyle = `rgba(${this.rgb}, ${this.life})`;

                // Add glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${this.rgb}, 0.5)`;

                if (this.type === 'circle') {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(this.x, this.y, this.size * 1.5, this.size * 1.5);
                }
                ctx.shadowBlur = 0; // Reset
            }
        }

        function createExplosion(x, y) {
            // Clear previous just in case
            // particles = []; 
            // Actually, let's keep adding for multiple clicks!

            const burstCount = 200; // MORE PARTICLES
            for (let i = 0; i < burstCount; i++) {
                const type = Math.random() > 0.6 ? 'square' : 'circle';
                particles.push(new ElectronicParticle(x, y, type));
            }

            // Add a centralized "White Flash" particle
            particles.push(new ElectronicParticle(x, y, 'circle')); // Just triggers animation start if list was empty

            if (!animationId) animate();
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Connect particles that are close (The "Network" effect)
            ctx.lineWidth = 0.5;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.update();
                p.draw();

                // Connect logic (expensive, keep distance low)
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 60 && p.life > 0.5 && p2.life > 0.5) {
                        ctx.strokeStyle = `rgba(140, 21, 21, ${0.15 * p.life})`; // Faint connective tissue
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

            if (particles.length > 0) {
                animationId = requestAnimationFrame(animate);
            } else {
                animationId = null;
            }
        }

        // Interaction Logic
        // Hover -> Small discrete burst (optional, maybe keep it clean)
        // trigger.addEventListener('mouseenter', () => createExplosion(trigger.getBoundingClientRect()));

        // Click -> Reveal QR Panel & Big Digital Explosion
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();

            const rect = trigger.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Toggle panel
            const isHidden = qrPanel.classList.contains('opacity-0');

            if (isHidden) {
                // Show with delay to sync with explosion
                qrPanel.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');

                // EXPLOSION!
                createExplosion(centerX, centerY);
                setTimeout(() => createExplosion(centerX, centerY), 150); // Second wave!
            } else {
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
