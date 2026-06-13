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

    // --- 11. Testimonials & Reviews System (localStorage) ---
    const starPickerStars = document.querySelector('.star-picker-stars');
    const stars = document.querySelectorAll('.star-pick');
    const starHint = document.querySelector('.star-picker-hint');
    const reviewForm = document.getElementById('reviewForm');
    const userReviewsContainer = document.getElementById('user-reviews-container');
    const reviewSuccess = document.getElementById('review-success');
    
    let selectedRating = 0;

    // List of premium gradient backgrounds for user review avatars
    const avatarGradients = [
        'linear-gradient(135deg, #ff003c, #ff6b8a)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #3b82f6, #2563eb)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
        'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'linear-gradient(135deg, #ec4899, #db2777)',
        'linear-gradient(135deg, #06b6d4, #0891b2)'
    ];

    // Helper to get a stable gradient index based on string hash (safeguarded against undefined name)
    function getAvatarGradient(name) {
        const safeName = name || 'زائر';
        let hash = 0;
        for (let i = 0; i < safeName.length; i++) {
            hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % avatarGradients.length;
        return avatarGradients[index];
    }

    // Escape HTML to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Safeguarded localStorage fetch to handle corrupted data
    function getSavedReviews() {
        try {
            const reviews = localStorage.getItem('nada_user_reviews');
            const parsed = reviews ? JSON.parse(reviews) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Error parsing reviews from localStorage:', e);
            return [];
        }
    }

    // Render client reviews safely
    function renderUserReviews() {
        if (!userReviewsContainer) return;
        
        const savedReviews = getSavedReviews();
        
        if (savedReviews.length === 0) {
            userReviewsContainer.innerHTML = '';
            userReviewsContainer.style.display = 'none';
            return;
        }
        
        userReviewsContainer.style.display = 'grid';
        userReviewsContainer.innerHTML = savedReviews.map(review => {
            if (!review) return '';
            
            const name = review.name || 'عميل كريم';
            const date = review.date || new Date().toLocaleDateString('ar-SA');
            const rating = typeof review.rating === 'number' ? review.rating : 5;
            const text = review.text || '';
            const service = review.service || 'تغطية مناسبة 📸';
            const avatarLetter = review.avatarLetter || name.charAt(0) || 'ع';

            // Generate stars HTML
            let starsHtml = '';
            const fullStars = Math.floor(rating);
            for (let i = 1; i <= 5; i++) {
                if (i <= fullStars) {
                    starsHtml += '<i class="fa-solid fa-star"></i>';
                } else {
                    starsHtml += '<i class="fa-regular fa-star" style="opacity: 0.3;"></i>';
                }
            }
            
            const gradient = getAvatarGradient(name);
            
            return `
                <div class="user-review-card animate-fade-in">
                    <div class="user-review-header">
                        <div class="user-review-avatar" style="background: ${gradient};">
                            ${escapeHtml(avatarLetter)}
                        </div>
                        <div class="user-review-meta">
                            <h4>${escapeHtml(name)}</h4>
                            <span>${escapeHtml(date)}</span>
                        </div>
                        <div class="user-review-stars">
                            ${starsHtml}
                        </div>
                    </div>
                    <p class="user-review-text">"${escapeHtml(text)}"</p>
                    <div class="user-review-footer">
                        <i class="fa-solid fa-camera-retro"></i>
                        <span>${escapeHtml(service)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (starPickerStars && stars.length > 0) {
        stars.forEach(star => {
            // Hover effect (mouseenter)
            star.addEventListener('mouseenter', () => {
                const hoverVal = parseInt(star.getAttribute('data-value'));
                stars.forEach(s => {
                    const sVal = parseInt(s.getAttribute('data-value'));
                    if (sVal <= hoverVal) {
                        s.classList.add('hovered');
                    } else {
                        s.classList.remove('hovered');
                    }
                });
            });

            // Click selection
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.getAttribute('data-value'));
                stars.forEach(s => {
                    const sVal = parseInt(s.getAttribute('data-value'));
                    if (sVal <= selectedRating) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
                if (starHint) {
                    starHint.textContent = `تقييمك: ${selectedRating} من 5 ⭐`;
                    starHint.style.color = '#fbbf24';
                }
            });
        });

        // Reset hover on mouseleave
        starPickerStars.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hovered'));
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const reviewNameInput = document.getElementById('reviewName');
            const reviewServiceSelect = document.getElementById('reviewService');
            const reviewTextInput = document.getElementById('reviewText');
            
            const name = reviewNameInput.value.trim();
            const service = reviewServiceSelect.value;
            const text = reviewTextInput.value.trim();
            
            // Validation
            if (!name) {
                alert('الرجاء إدخال الاسم الكريم.');
                reviewNameInput.focus();
                return;
            }
            if (selectedRating === 0) {
                alert('الرجاء تحديد التقييم بالنجوم.');
                return;
            }
            if (!text) {
                alert('الرجاء كتابة رأيك الكريم.');
                reviewTextInput.focus();
                return;
            }
            
            // Success review object
            const newReview = {
                id: Date.now(),
                name: name,
                service: service || 'تغطية مناسبة 📸',
                rating: selectedRating,
                text: text,
                date: new Date().toLocaleDateString('ar-SA'),
                avatarLetter: name.charAt(0)
            };
            
            // Save to localStorage
            const savedReviews = getSavedReviews();
            savedReviews.unshift(newReview); // Put it at the beginning of user reviews
            localStorage.setItem('nada_user_reviews', JSON.stringify(savedReviews));
            
            // Render reviews
            renderUserReviews();
            
            // Show success message
            if (reviewSuccess) {
                reviewSuccess.style.display = 'flex';
                setTimeout(() => {
                    reviewSuccess.style.display = 'none';
                }, 5000);
            }
            
            // Reset form
            reviewForm.reset();
            selectedRating = 0;
            stars.forEach(s => {
                s.classList.remove('selected');
                s.classList.remove('hovered');
            });
            if (starHint) {
                starHint.textContent = 'اضغط لاختيار التقييم';
                starHint.style.color = '';
            }
        });
    }

    // Initial load and render of user reviews
    renderUserReviews();

    // --- 12. Hover Sound System (Web Audio API) ---
    let audioCtx = null;

    function getAudioCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }

    function playHoverSound(freq = 520, vol = 0.07, type = 'sine', duration = 0.12) {
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.82, ctx.currentTime + duration);
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (e) {}
    }

    // Camera shutter sound (click + mechanical feel)
    function playCameraShutter() {
        try {
            const ctx = getAudioCtx();
            const now = ctx.currentTime;

            // Click transient
            const bufSize = ctx.sampleRate * 0.08;
            const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 6);
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const clickGain = ctx.createGain();
            clickGain.gain.setValueAtTime(0.32, now);
            clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

            // Low thud
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(90, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);
            const thudGain = ctx.createGain();
            thudGain.gain.setValueAtTime(0.22, now);
            thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

            noise.connect(clickGain);
            clickGain.connect(ctx.destination);
            osc.connect(thudGain);
            thudGain.connect(ctx.destination);

            noise.start(now);
            osc.start(now);
            osc.stop(now + 0.08);

            // Flash overlay effect
            const flash = document.createElement('div');
            flash.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:99999;transition:opacity 0.05s ease;';
            document.body.appendChild(flash);
            requestAnimationFrame(() => {
                flash.style.opacity = '0.18';
                setTimeout(() => {
                    flash.style.opacity = '0';
                    setTimeout(() => flash.remove(), 200);
                }, 60);
            });
        } catch (e) {}
    }

    // Attach hover sounds
    function attachHoverSounds() {
        // Nav & footer links
        document.querySelectorAll('.nav-link, .mobile-link, .footer-links a').forEach(el => {
            el.addEventListener('mouseenter', () => playHoverSound(700, 0.055, 'sine', 0.1));
        });
        // Social icons
        document.querySelectorAll('.social-icon').forEach(el => {
            el.addEventListener('mouseenter', () => playHoverSound(580, 0.07, 'sine', 0.13));
        });
        // Buttons
        document.querySelectorAll('.btn, .filter-btn, .hamburger-btn').forEach(el => {
            el.addEventListener('mouseenter', () => playHoverSound(620, 0.06, 'sine', 0.11));
            el.addEventListener('click',      () => playHoverSound(760, 0.09, 'sine', 0.09));
        });
        // Service & gallery cards
        document.querySelectorAll('.service-card, .gallery-item, .testimonial-card').forEach(el => {
            el.addEventListener('mouseenter', () => playHoverSound(480, 0.045, 'sine', 0.14));
        });
        // Star rating
        document.querySelectorAll('.star-pick').forEach(el => {
            el.addEventListener('mouseenter', () => playHoverSound(660, 0.06, 'triangle', 0.1));
            el.addEventListener('click',      () => playHoverSound(800, 0.09, 'triangle', 0.12));
        });
        // Info items
        document.querySelectorAll('.info-item, .about-stat').forEach(el => {
            el.addEventListener('mouseenter', () => playHoverSound(540, 0.04, 'sine', 0.1));
        });

        // === CAMERA SHUTTER on hero avatar hover ===
        const heroImg = document.querySelector('.hero-img, .hero-image-wrapper img, .glow-ring ~ * img');
        const heroWrapper = document.querySelector('.hero-image-wrapper');
        const target = heroWrapper || heroImg;
        if (target) {
            target.addEventListener('mouseenter', () => {
                playCameraShutter();
                target.style.transition = 'transform 0.15s ease, filter 0.15s ease';
                target.style.filter = 'brightness(1.15) saturate(1.2)';
                target.style.transform = 'scale(1.04)';
                setTimeout(() => {
                    target.style.filter = '';
                    target.style.transform = '';
                }, 350);
            });
        }
    }

    // Unlock AudioContext on first interaction
    const unlockAudio = () => {
        getAudioCtx();
        attachHoverSounds();
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

});