/* ============================================
   RAJESH CHOUDHARI — PORTFOLIO JAVASCRIPT
   Futuristic Animated Space Background + UI
============================================ */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initSpaceCanvas();
    initTypewriter();
    initNavigation();
    initScrollReveal();
    initVideoPlayer();
    initSkillBars();
    initStatCounters();
    initFeedbackForm();
});

/* ============================================
   1. ANIMATED SPACE / PARTICLE BACKGROUND
   Uses HTML5 Canvas for custom star field effect
============================================ */
function initSpaceCanvas() {
    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let shootingStars = [];
    let nebulaClouds = [];
    let mouse = { x: 0, y: 0 };
    let animationId;

    // Config
    const STAR_COUNT = 250;
    const SHOOTING_STAR_INTERVAL = 4000; // ms

    // Resize canvas
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    // Star class
    class Star {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.z = Math.random() * 3; // depth layer
            this.size = Math.random() * 1.5 + 0.3;
            this.baseOpacity = Math.random() * 0.6 + 0.3;
            this.opacity = this.baseOpacity;
            this.twinkleSpeed = Math.random() * 0.02 + 0.005;
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.vx = (Math.random() - 0.5) * 0.08 * this.z;
            this.vy = (Math.random() - 0.5) * 0.04 * this.z;

            // Color variety
            const colors = [
                '255, 255, 255',    // white
                '200, 220, 255',    // blue-white
                '255, 240, 200',    // warm white
                '0, 255, 136',      // neon green
                '0, 229, 255',      // neon cyan
                '179, 136, 255',    // neon purple
            ];
            const weights = [40, 25, 20, 5, 5, 5];
            this.color = weightedRandom(colors, weights);
        }

        update(time) {
            // Twinkle
            this.opacity = this.baseOpacity + Math.sin(time * this.twinkleSpeed + this.twinklePhase) * 0.3;
            this.opacity = Math.max(0, Math.min(1, this.opacity));

            // Parallax movement based on mouse (subtle)
            const parallaxFactor = this.z * 0.0002;
            this.x += this.vx + (mouse.x - width / 2) * parallaxFactor;
            this.y += this.vy + (mouse.y - height / 2) * parallaxFactor;

            // Wrap around
            if (this.x < -5) this.x = width + 5;
            if (this.x > width + 5) this.x = -5;
            if (this.y < -5) this.y = height + 5;
            if (this.y > height + 5) this.y = -5;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.z * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();

            // Glow effect for brighter stars
            if (this.opacity > 0.5 && this.size > 1) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * this.z * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${this.opacity * 0.1})`;
                ctx.fill();
            }
        }
    }

    // Shooting star class
    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width * 0.7;
            this.y = Math.random() * height * 0.4;
            this.length = Math.random() * 80 + 40;
            this.speed = Math.random() * 8 + 5;
            this.angle = Math.PI / 6 + Math.random() * 0.3;
            this.opacity = 1;
            this.decay = Math.random() * 0.015 + 0.01;
            this.active = true;
        }

        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.opacity -= this.decay;
            if (this.opacity <= 0) this.active = false;
        }

        draw() {
            const tailX = this.x - Math.cos(this.angle) * this.length;
            const tailY = this.y - Math.sin(this.angle) * this.length;

            const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
            gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Head glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Nebula cloud (subtle background color patches)
    class NebulaCloud {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 200 + 100;
            const colors = [
                [0, 255, 136],
                [0, 229, 255],
                [179, 136, 255],
            ];
            const c = colors[Math.floor(Math.random() * colors.length)];
            this.color = c;
            this.opacity = Math.random() * 0.015 + 0.005;
            this.phase = Math.random() * Math.PI * 2;
        }

        update(time) {
            this.currentOpacity = this.opacity + Math.sin(time * 0.001 + this.phase) * 0.005;
        }

        draw() {
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius
            );
            gradient.addColorStop(0, `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.currentOpacity})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
    }

    // Weighted random
    function weightedRandom(items, weights) {
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) return items[i];
        }
        return items[items.length - 1];
    }

    // Initialize
    function init() {
        resize();
        stars = Array.from({ length: STAR_COUNT }, () => new Star());
        nebulaClouds = Array.from({ length: 5 }, () => new NebulaCloud());
    }

    // Spawn shooting star periodically
    setInterval(() => {
        if (shootingStars.length < 3) {
            shootingStars.push(new ShootingStar());
        }
    }, SHOOTING_STAR_INTERVAL);

    // Animation loop
    function animate(time) {
        ctx.clearRect(0, 0, width, height);

        // Draw nebula clouds
        nebulaClouds.forEach(cloud => {
            cloud.update(time);
            cloud.draw();
        });

        // Draw stars
        stars.forEach(star => {
            star.update(time);
            star.draw();
        });

        // Draw shooting stars
        shootingStars = shootingStars.filter(s => s.active);
        shootingStars.forEach(s => {
            s.update();
            s.draw();
        });

        animationId = requestAnimationFrame(animate);
    }

    // Track mouse for parallax
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Handle resize
    window.addEventListener('resize', () => {
        resize();
        // Re-position nebula clouds
        nebulaClouds.forEach(cloud => {
            cloud.x = Math.random() * width;
            cloud.y = Math.random() * height;
        });
    });

    init();
    animate(0);
}

/* ============================================
   2. TYPEWRITER EFFECT
============================================ */
function initTypewriter() {
    const element = document.getElementById('typewriter');
    if (!element) return;

    const phrases = [
        'Python & Machine Learning',
        'Exploring Quantum Computing',
        'AI for Social Good',
        'Data Science Enthusiast',
        'Building Intelligent Systems',
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 60;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            element.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 30;
        } else {
            element.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 60;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Pause at end of phrase
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    // Start after a small delay
    setTimeout(type, 1200);
}

/* ============================================
   3. NAVIGATION
============================================ */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const allNavLinks = document.querySelectorAll('.nav-link');

    // Scroll handler - add 'scrolled' class
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        updateActiveNavLink();

        lastScroll = scrollTop;
    });

    // Toggle mobile menu
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile menu on link click
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        }
    });

    // Update active nav link
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                allNavLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }
}

/* ============================================
   4. SCROLL REVEAL ANIMATIONS
============================================ */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/* ============================================
   5. VIDEO PLAYER
============================================ */
function initVideoPlayer() {
    const video = document.getElementById('introVideo');
    const overlay = document.getElementById('videoOverlay');
    const playBtn = document.getElementById('playBtn');

    if (!video || !overlay || !playBtn) return;

    let hasStarted = false;

    // Play on overlay click — first interaction
    overlay.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            overlay.classList.add('hidden');
            // Add native controls after first click so user can pause/seek freely
            if (!hasStarted) {
                hasStarted = true;
                video.setAttribute('controls', '');
            }
        }
    });

    // Only show overlay again when video fully ends (not on pause)
    video.addEventListener('ended', () => {
        video.removeAttribute('controls');
        hasStarted = false;
        overlay.classList.remove('hidden');
    });
}

/* ============================================
   6. SKILL BAR ANIMATIONS
============================================ */
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetWidth = bar.getAttribute('data-width');
                bar.style.width = targetWidth + '%';
                observer.unobserve(bar);
            }
        });
    }, {
        threshold: 0.5
    });

    skillBars.forEach(bar => observer.observe(bar));
}

/* ============================================
   7. STAT COUNTER ANIMATION
============================================ */
function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.5
    });

    stats.forEach(stat => observer.observe(stat));

    function animateCounter(el, target) {
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current);
        }, 50);
    }
}

/* ============================================
   8. SMOOTH SCROLL FOR ANCHOR LINKS
   (Enhancement over CSS scroll-behavior)
============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetEl.offsetTop - navHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

/* ============================================
   9. FEEDBACK FORM (Star Rating + AJAX Submit)
============================================ */
function initFeedbackForm() {
    const form = document.getElementById('feedbackForm');
    const starRating = document.getElementById('starRating');
    const ratingInput = document.getElementById('ratingValue');
    const successMsg = document.getElementById('feedbackSuccess');

    if (!form || !starRating) return;

    const starBtns = starRating.querySelectorAll('.star-btn');
    let selectedRating = 0;

    // Highlight stars up to a given value
    function highlightStars(value, className) {
        starBtns.forEach(s => {
            const starVal = parseInt(s.getAttribute('data-value'));
            if (starVal <= value) {
                s.classList.add(className);
            } else {
                s.classList.remove(className);
            }
        });
    }

    // Container-level hover (event delegation for reliability)
    starRating.addEventListener('mouseover', (e) => {
        const btn = e.target.closest('.star-btn');
        if (!btn) return;
        const val = parseInt(btn.getAttribute('data-value'));
        highlightStars(val, 'hovered');
    });

    starRating.addEventListener('mouseout', () => {
        starBtns.forEach(s => s.classList.remove('hovered'));
    });

    // Click to select
    starRating.addEventListener('click', (e) => {
        const btn = e.target.closest('.star-btn');
        if (!btn) return;
        selectedRating = parseInt(btn.getAttribute('data-value'));
        ratingInput.value = selectedRating;
        highlightStars(selectedRating, 'active');
        // Remove active from stars above selected
        starBtns.forEach(s => {
            if (parseInt(s.getAttribute('data-value')) > selectedRating) {
                s.classList.remove('active');
            }
        });
    });

    // AJAX form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('feedbackSubmit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // Show success message
                successMsg.classList.add('show');
                form.reset();
                selectedRating = 0;
                starBtns.forEach(s => s.classList.remove('active'));

                // Hide success after 4 seconds
                setTimeout(() => {
                    successMsg.classList.remove('show');
                }, 4000);
            } else {
                alert('Oops! Something went wrong. Please try again.');
            }
        } catch (err) {
            alert('Network error. Please check your connection and try again.');
        }

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}
