/* ==========================================================================
   JavaScript Interactive Logic - Nada Photography (Wedding & Events)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Custom Interactive Cursors & Mouse Ambient Glow ---
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    
    // Dynamically create and append the soft mouse ambient glow
    const mouseGlow = document.createElement('div');
    mouseGlow.className = 'mouse-glow';
    document.body.appendChild(mouseGlow);

    if (cursor && cursorDot) {
        document.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                cursor.style.left = `${e.clientX}px`;
                cursor.style.top = `${e.clientY}px`;
                cursorDot.style.left = `${e.clientX}px`;
                cursorDot.style.top = `${e.clientY}px`;
                mouseGlow.style.left = `${e.clientX}px`;
                mouseGlow.style.top = `${e.clientY}px`;
            });
        });

        // Event delegation for hover states on all interactive elements
        document.addEventListener('mouseenter', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return; // Guard: skip Text nodes
            if (target.tagName === 'A' || 
                target.tagName === 'BUTTON' || 
                target.closest('.gallery-item') || 
                target.closest('.social-icon') ||
                target.tagName === 'INPUT' || 
                target.tagName === 'SELECT' || 
                target.tagName === 'TEXTAREA' || 
                target.classList.contains('filter-btn')) {
                
                cursor.style.width = '55px';
                cursor.style.height = '55px';
                cursor.style.backgroundColor = 'rgba(255, 0, 60, 0.15)';
                cursor.style.borderColor = 'var(--accent-color)';
                mouseGlow.style.width = '450px';
                mouseGlow.style.height = '450px';
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return; // Guard: skip Text nodes
            if (target.tagName === 'A' || 
                target.tagName === 'BUTTON' || 
                target.closest('.gallery-item') || 
                target.closest('.social-icon') ||
                target.tagName === 'INPUT' || 
                target.tagName === 'SELECT' || 
                target.tagName === 'TEXTAREA' || 
                target.classList.contains('filter-btn')) {
                
                cursor.style.width = '30px';
                cursor.style.height = '30px';
                cursor.style.backgroundColor = 'transparent';
                cursor.style.borderColor = 'var(--accent-color)';
                mouseGlow.style.width = '350px';
                mouseGlow.style.height = '350px';
            }
        }, true);

        // Click transformations
        document.addEventListener('mousedown', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });

        document.addEventListener('mouseup', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    // --- 2. Background Glowing Particle System (Canvas) ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 60;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Particle class definition
        class Particle {
            constructor() {
                this.reset(true);
            }

            reset(init = false) {
                this.x = Math.random() * canvas.width;
                // Initialize randomly on screen, or respawn at bottom
                this.y = init ? Math.random() * canvas.height : canvas.height + 10;
                this.radius = Math.random() * 2 + 0.8;
                this.vy = -(Math.random() * 0.6 + 0.2); // Slow upward drift
                this.vx = Math.random() * 0.4 - 0.2;     // Slight wobble
                this.opacity = Math.random() * 0.4 + 0.1;
                this.fadeSpeed = Math.random() * 0.005 + 0.002;
            }

            update() {
                this.y += this.vy;
                this.x += this.vx;
                
                // Slowly cycle opacity
                this.opacity -= this.fadeSpeed;
                if (this.opacity <= 0 || this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                    this.reset(false);
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 0, 60, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Initialize particles array
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation Loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw & update particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        }

        animate();
    }

    // --- 3. Header Scroll States ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 4. Typing Text Effect (Weddings & Events only) ---
    const typingTextElement = document.querySelector('.typing-text');
    if (typingTextElement) {
        const professions = [
            'تصوير الأعراس والزفاف 💍',
            'توثيق الخطوبة وعقد القران ✨💍',
            'تغطية الحفلات والمناسبات الخاصة 🎉',
            'تخليد اللحظات العائلية السعيدة 📸'
        ];
        
        let professionIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        function type() {
            const currentProfession = professions[professionIndex];
            
            if (isDeleting) {
                typingTextElement.textContent = currentProfession.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typingTextElement.textContent = currentProfession.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 120;
            }

            if (!isDeleting && charIndex === currentProfession.length) {
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                professionIndex = (professionIndex + 1) % professions.length;
                typingSpeed = 500;
            }

            setTimeout(type, typingSpeed);
        }

        setTimeout(type, 1000);
    }

    // --- 5. Mobile Menu Navigation ---
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (hamburgerBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- 6. Scroll Active Link Highlighting ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    function highlightNavLink() {
        let scrollY = window.scrollY;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
                
                mobileLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavLink);

    // --- 7. Gallery Filtering System ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (filterValue === 'all' || itemCategory === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // --- 8. Lightbox Modal ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    let currentGalleryList = [];
    let currentImageIndex = 0;

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            
            currentGalleryList = Array.from(galleryItems).filter(i => {
                const cat = i.getAttribute('data-category');
                return activeFilter === 'all' || cat === activeFilter;
            });

            currentImageIndex = currentGalleryList.indexOf(item);
            
            updateLightboxContent();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function updateLightboxContent() {
        const currentItem = currentGalleryList[currentImageIndex];
        const imgElement = currentItem.querySelector('img');
        const titleElement = currentItem.querySelector('.gallery-title');
        
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = imgElement.src;
            lightboxCaption.textContent = titleElement.textContent;
            lightboxImg.style.opacity = '1';
        }, 150);
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentGalleryList.length;
        updateLightboxContent();
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + currentGalleryList.length) % currentGalleryList.length;
        updateLightboxContent();
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showNextImage();
            } else if (e.key === 'ArrowRight') {
                showPrevImage();
            }
        }
    });

    // --- 9. Booking Submission & WhatsApp API ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phoneNumber = document.getElementById('phoneNumber').value.trim();
            const bookingService = document.getElementById('bookingService');
            const serviceText = bookingService.options[bookingService.selectedIndex].text;
            const message = document.getElementById('message').value.trim();
            
            const waMessage = 
`*طلب حجز جلسة تصوير جديدة* 📸✨
----------------------------------
*الاسم الكامل:* ${fullName}
*البريد الإلكتروني:* ${email}
*رقم الجوال:* ${phoneNumber}
*الخدمة المطلوبة:* ${serviceText}
----------------------------------
*تفاصيل الجلسة:*
${message}
----------------------------------
تم الإرسال من نموذج الاتصال في الموقع الشخصي للمصورة ندى.`;

            const encodedText = encodeURIComponent(waMessage);
            const waPhoneNumber = '966551978419';

            const whatsappUrl = `https://wa.me/${waPhoneNumber}?text=${encodedText}`;
            window.open(whatsappUrl, '_blank');
            
            contactForm.reset();
        });
    }

    // --- 10. Countdown Timer for Discount Offer (resets every 7 days) ---
    const timerHours   = document.getElementById('timer-hours');
    const timerMinutes = document.getElementById('timer-minutes');
    const timerSeconds = document.getElementById('timer-seconds');

    if (timerHours && timerMinutes && timerSeconds) {
        const STORAGE_KEY  = 'nada_discount_deadline';
        const DURATION_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days
        let deadline = parseInt(localStorage.getItem(STORAGE_KEY));

        // Create a fresh deadline if missing or already expired
        if (!deadline || Date.now() > deadline) {
            deadline = Date.now() + DURATION_MS;
            localStorage.setItem(STORAGE_KEY, deadline);
        }

        function pad(n) {
            return String(Math.max(0, n)).padStart(2, '0');
        }

        function updateTimer() {
            let remaining = deadline - Date.now();

            if (remaining <= 0) {
                // Renew for another 7 days
                deadline = Date.now() + DURATION_MS;
                localStorage.setItem(STORAGE_KEY, deadline);
                remaining = DURATION_MS;
            }

            const totalSeconds = Math.floor(remaining / 1000);
            const hours   = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            timerHours.textContent   = pad(hours);
            timerMinutes.textContent = pad(minutes);
            timerSeconds.textContent = pad(seconds);
        }

        updateTimer();
        setInterval(updateTimer, 1000);
    }
});
