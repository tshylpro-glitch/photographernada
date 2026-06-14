/* Nada Photography - Full JavaScript v3 */
document.addEventListener('DOMContentLoaded', () => {

    // ===== 1. SOUND SYSTEM (initialized FIRST so hover sounds work everywhere) =====
    let audioCtx = null;
    let audioReady = false;
    
    function ensureAudio() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch(e) { return false; }
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        audioReady = (audioCtx.state === 'running');
        return audioReady;
    }

    function playHoverSound() {
        if (!audioReady) return;
        try {
            const t = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.frequency.value = 900;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.06, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            osc.start(t);
            osc.stop(t + 0.12);
        } catch(e){}
    }

    function playClickSound() {
        if (!audioReady) return;
        try {
            const t = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(1400, t);
            osc.frequency.exponentialRampToValueAtTime(500, t + 0.08);
            osc.type = 'triangle';
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
        } catch(e){}
    }

    function playCameraShutter() {
        if (!audioReady) return;
        try {
            const t = audioCtx.currentTime;
            const dur = 0.18;
            const bufferSize = Math.floor(audioCtx.sampleRate * dur);
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.5);
            }
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 3800;
            filter.Q.value = 1.2;
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
            noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
            noise.start(t);
            const osc = audioCtx.createOscillator();
            const oGain = audioCtx.createGain();
            osc.frequency.value = 90;
            osc.type = 'square';
            oGain.gain.setValueAtTime(0.18, t);
            oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
            osc.connect(oGain); oGain.connect(audioCtx.destination);
            osc.start(t); osc.stop(t + 0.06);
        } catch(e){}
    }

    // Unlock audio on FIRST user interaction (any event)
    function unlockAudio() {
        ensureAudio();
        if (audioReady) {
            ['click','touchstart','keydown','mousemove'].forEach(ev => {
                document.removeEventListener(ev, unlockAudio);
            });
        }
    }
    ['click','touchstart','keydown','mousemove'].forEach(ev => {
        document.addEventListener(ev, unlockAudio, { once: false });
    });

    // Attach sounds with EVENT DELEGATION (works even for dynamic elements)
    document.addEventListener('mouseenter', (e) => {
        if (!(e.target instanceof Element)) return;
        const target = e.target;
        if (target.matches('.nav-link, .mobile-link, .logo, .social-icon, .filter-btn, .footer-links a, .pricing-card, .term-card, .service-card, .testimonial-card, .gallery-item, .info-icon, .btn, .floating-cart')) {
            playHoverSound();
        }
    }, true);

    document.addEventListener('click', (e) => {
        if (!(e.target instanceof Element)) return;
        const target = e.target.closest('.btn, .filter-btn, .hamburger-btn, .add-to-cart-btn, .floating-cart, .slider-arrow, .cart-close, .cart-item-remove, #applyCouponBtn');
        if (target) playClickSound();
    }, true);

    // ===== 2. Particle Canvas =====
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        class Particle {
            constructor() { this.reset(true); }
            reset(init = false) {
                this.x = Math.random() * canvas.width;
                this.y = init ? Math.random() * canvas.height : canvas.height + 10;
                this.radius = Math.random() * 2 + 0.8;
                this.vy = -(Math.random() * 0.6 + 0.2);
                this.vx = Math.random() * 0.4 - 0.2;
                this.opacity = Math.random() * 0.4 + 0.1;
                this.fadeSpeed = Math.random() * 0.005 + 0.002;
            }
            update() {
                this.y += this.vy; this.x += this.vx;
                this.opacity -= this.fadeSpeed;
                if (this.opacity <= 0 || this.y < -10) this.reset(false);
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 0, 60, ${this.opacity})`;
                ctx.fill();
            }
        }
        for (let i = 0; i < 60; i++) particles.push(new Particle());
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ===== 3. Custom Cursor =====
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    if (cursor && cursorDot) {
        document.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                cursor.style.left = `${e.clientX}px`;
                cursor.style.top = `${e.clientY}px`;
                cursorDot.style.left = `${e.clientX}px`;
                cursorDot.style.top = `${e.clientY}px`;
            });
        });
    }

    // ===== 4. Header scroll =====
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // ===== 5. Typing effect =====
    const typingTextElement = document.querySelector('.typing-text');
    if (typingTextElement) {
        const professions = [
            'تصوير الأعراس والزفاف 💍',
            'توثيق الخطوبة وعقد القران ✨',
            'تغطية الحفلات والمناسبات الخاصة 🎉',
            'تخليد اللحظات العائلية السعيدة 📸'
        ];
        let pIdx = 0, cIdx = 0, isDel = false, speed = 100;
        function type() {
            const curr = professions[pIdx];
            if (isDel) { typingTextElement.textContent = curr.substring(0, cIdx - 1); cIdx--; speed = 50; }
            else { typingTextElement.textContent = curr.substring(0, cIdx + 1); cIdx++; speed = 120; }
            if (!isDel && cIdx === curr.length) { speed = 2000; isDel = true; }
            else if (isDel && cIdx === 0) { isDel = false; pIdx = (pIdx + 1) % professions.length; speed = 500; }
            setTimeout(type, speed);
        }
        setTimeout(type, 1000);
    }

    // ===== 6. Mobile menu =====
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    if (hamburgerBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });
        mobileLinks.forEach(link => link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        }));
    }

    // ===== 7. Active nav highlight =====
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let scrollY = window.scrollY;
        sections.forEach(section => {
            const top = section.offsetTop - 150;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY > top && scrollY <= top + height) {
                navLinks.forEach(link => { link.classList.remove('active'); if (link.getAttribute('href') === `#${id}`) link.classList.add('active'); });
            }
        });
    });

    // ===== 8. Gallery filters =====
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            galleryItems.forEach(item => {
                const cat = item.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    item.style.display = 'block';
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
                } else {
                    item.style.opacity = '0'; item.style.transform = 'scale(0.9)';
                    setTimeout(() => { item.style.display = 'none'; }, 300);
                }
            });
        });
    });

    // ===== 9. Lightbox =====
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    let currentList = [], currentIdx = 0;
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            currentList = Array.from(galleryItems).filter(i => activeFilter === 'all' || i.getAttribute('data-category') === activeFilter);
            currentIdx = currentList.indexOf(item);
            updateLightbox();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    function updateLightbox() {
        const item = currentList[currentIdx];
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-title');
        lightboxImg.src = img.src;
        lightboxCaption.textContent = title.textContent;
    }
    function closeLightbox() { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', () => { currentIdx = (currentIdx + 1) % currentList.length; updateLightbox(); });
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => { currentIdx = (currentIdx - 1 + currentList.length) % currentList.length; updateLightbox(); });
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    // ===== 10. Camera Flash on Hero Image =====
    const cameraFlash = document.createElement('div');
    cameraFlash.className = 'camera-flash';
    document.body.appendChild(cameraFlash);
    const heroImageWrapper = document.querySelector('.hero-image-wrapper');
    function triggerFlash() {
        playCameraShutter();
        cameraFlash.classList.remove('active');
        void cameraFlash.offsetWidth;
        cameraFlash.classList.add('active');
        setTimeout(() => cameraFlash.classList.remove('active'), 600);
    }
    if (heroImageWrapper) {
        heroImageWrapper.addEventListener('mouseenter', triggerFlash);
        heroImageWrapper.addEventListener('click', triggerFlash);
    }

    // ===== 11. Countdown Timer =====
    const tH = document.getElementById('timer-hours');
    const tM = document.getElementById('timer-minutes');
    const tS = document.getElementById('timer-seconds');
    if (tH && tM && tS) {
        const KEY = 'nada_discount_deadline';
        const DUR = 7 * 24 * 60 * 60 * 1000;
        let deadline = parseInt(localStorage.getItem(KEY));
        if (!deadline || Date.now() > deadline) {
            deadline = Date.now() + DUR;
            localStorage.setItem(KEY, deadline);
        }
        function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }
        function update() {
            let r = deadline - Date.now();
            if (r <= 0) { deadline = Date.now() + DUR; localStorage.setItem(KEY, deadline); r = DUR; }
            const tot = Math.floor(r / 1000);
            tH.textContent = pad(Math.floor(tot / 3600));
            tM.textContent = pad(Math.floor((tot % 3600) / 60));
            tS.textContent = pad(tot % 60);
        }
        update();
        setInterval(update, 1000);
    }

    // ===== 12. UNIFIED REVIEWS + SLIDER SYSTEM =====
    // Default reviews (originally hardcoded in HTML, now managed in JS)
    const defaultReviews = [
        { name: 'نورة السبيعي', role: 'عروس سعيدة ✨', rating: 5, text: 'المصورة ندى جعلت يوم زفافي أسطورياً! كل صورة تحكي قصة مشاعر حقيقية. أسلوبها راقٍ جداً وإبداعها لا حدود له.', service: 'تصوير حفل زفاف', icon: 'fa-camera' },
        { name: 'سارة العمري', role: 'عقد قران 💍', rating: 5, text: 'احترافية عالية ودقة في التقاط كل التفاصيل. صور الخطوبة طلعت خيال والألوان كانت سينمائية.', service: 'تصوير خطوبة', icon: 'fa-ring' },
        { name: 'منى الشهري', role: 'حفل تخرج 🎓', rating: 5, text: 'صورت معي حفل تخرج ابنتي وكانت التجربة رائعة. سريعة، محترفة، ولديها عين فنية استثنائية.', service: 'مناسبة خاصة', icon: 'fa-wand-magic-sparkles' },
        { name: 'رهف القحطاني', role: 'عروس 👰', rating: 5, text: 'التعامل مع ندى ممتع جداً، هادئة ومنظمة وتعطيك راحة تامة. خرجت الصور طبيعية وجميلة.', service: 'تصوير حفل زفاف', icon: 'fa-heart' },
        { name: 'فاطمة الدوسري', role: 'أم عريس 💐', rating: 4.5, text: 'وثّقت لنا ليلة الحنة وحفل الزفاف بشكل مذهل. التسليم سريع والصور سينمائية فاخرة.', service: 'تصوير متكامل', icon: 'fa-camera-retro' },
        { name: 'هيا العنزي', role: 'خطوبة 💎', rating: 5, text: 'جلسة الخطوبة مع ندى كانت تجربة لا تُنسى! خلقت أجواءً رومانسية والصور تعبّر عن اللحظات بصدق.', service: 'جلسة خطوبة', icon: 'fa-ring' }
    ];

    const gradients = [
        'linear-gradient(135deg, #ff003c, #ff6b8a)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #3b82f6, #2563eb)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
        'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'linear-gradient(135deg, #ec4899, #db2777)',
        'linear-gradient(135deg, #06b6d4, #0891b2)'
    ];
    function getGradient(name) {
        const safe = name || 'ز';
        let hash = 0;
        for (let i = 0; i < safe.length; i++) hash = safe.charCodeAt(i) + ((hash << 5) - hash);
        return gradients[Math.abs(hash) % gradients.length];
    }
    function escHtml(s) {
        if (!s) return '';
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
    function getUserReviews() {
        try {
            const r = localStorage.getItem('nada_user_reviews');
            const p = r ? JSON.parse(r) : [];
            return Array.isArray(p) ? p : [];
        } catch (e) { return []; }
    }
    function buildStarsHTML(rating) {
        let stars = '';
        const full = Math.floor(rating);
        const half = (rating - full) >= 0.5;
        for (let i = 1; i <= 5; i++) {
            if (i <= full) stars += '<i class="fa-solid fa-star"></i>';
            else if (i === full + 1 && half) stars += '<i class="fa-solid fa-star-half-stroke"></i>';
            else stars += '<i class="fa-regular fa-star" style="opacity:0.3;"></i>';
        }
        return stars;
    }
    function buildReviewCard(review) {
        const name = review.name || 'عميل';
        const role = review.role || review.service || 'تغطية مناسبة';
        const rating = review.rating || 5;
        const text = review.text || '';
        const service = review.service || 'تغطية مناسبة 📸';
        const icon = review.icon || 'fa-camera';
        const letter = name.charAt(0) || 'ع';
        return `<div class="testimonial-card">
            <div class="testimonial-header">
                <div class="testimonial-avatar" style="background: ${getGradient(name)};">${escHtml(letter)}</div>
                <div class="testimonial-meta"><h4>${escHtml(name)}</h4><span>${escHtml(role)}</span></div>
                <div class="testimonial-stars">${buildStarsHTML(rating)}</div>
            </div>
            <p class="testimonial-text">"${escHtml(text)}"</p>
            <div class="testimonial-footer"><i class="fa-solid ${icon}"></i><span>${escHtml(service)}</span></div>
        </div>`;
    }

    const sliderEl = document.getElementById('testimonialsSlider');
    let autoScrollInterval = null;
    let cardScrollWidth = 375;

    function renderAllReviews() {
        if (!sliderEl) return;
        // Combine user reviews FIRST (newest first), then default reviews
        const userReviews = getUserReviews();
        const allReviews = [...userReviews, ...defaultReviews];
        sliderEl.innerHTML = allReviews.map(buildReviewCard).join('');
        // Re-measure card width
        setTimeout(() => {
            const card = sliderEl.querySelector('.testimonial-card');
            if (card) cardScrollWidth = card.offsetWidth + 25;
        }, 100);
    }
    renderAllReviews();

    // Slider controls
    const prevBtn = document.getElementById('testPrev');
    const nextBtn = document.getElementById('testNext');

    function scrollSliderNext() {
        if (!sliderEl) return;
        const maxScroll = sliderEl.scrollWidth - sliderEl.clientWidth;
        const currentPos = Math.abs(sliderEl.scrollLeft);
        if (currentPos >= maxScroll - 20) {
            sliderEl.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            sliderEl.scrollBy({ left: -cardScrollWidth, behavior: 'smooth' });
        }
    }
    function scrollSliderPrev() {
        if (!sliderEl) return;
        sliderEl.scrollBy({ left: cardScrollWidth, behavior: 'smooth' });
    }

    if (nextBtn) nextBtn.addEventListener('click', scrollSliderNext);
    if (prevBtn) prevBtn.addEventListener('click', scrollSliderPrev);

    function startAutoScroll() {
        stopAutoScroll();
        autoScrollInterval = setInterval(scrollSliderNext, 5000);
    }
    function stopAutoScroll() {
        if (autoScrollInterval) { clearInterval(autoScrollInterval); autoScrollInterval = null; }
    }

    if (sliderEl) {
        setTimeout(startAutoScroll, 1000);
        sliderEl.addEventListener('mouseenter', stopAutoScroll);
        sliderEl.addEventListener('mouseleave', startAutoScroll);
        sliderEl.addEventListener('touchstart', stopAutoScroll, { passive: true });
    }

    // ===== 13. REVIEW FORM (adds to slider directly) =====
    const starsPicker = document.querySelectorAll('.star-pick');
    const starHint = document.querySelector('.star-picker-hint');
    const reviewForm = document.getElementById('reviewForm');
    const reviewSuccess = document.getElementById('review-success');
    let selectedRating = 0;

    starsPicker.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const v = parseInt(star.getAttribute('data-value'));
            starsPicker.forEach(s => { parseInt(s.getAttribute('data-value')) <= v ? s.classList.add('hovered') : s.classList.remove('hovered'); });
        });
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.getAttribute('data-value'));
            starsPicker.forEach(s => { parseInt(s.getAttribute('data-value')) <= selectedRating ? s.classList.add('selected') : s.classList.remove('selected'); });
            if (starHint) { starHint.textContent = `تقييمك: ${selectedRating} من 5 ⭐`; starHint.style.color = '#fbbf24'; }
        });
    });
    const sps = document.querySelector('.star-picker-stars');
    if (sps) sps.addEventListener('mouseleave', () => starsPicker.forEach(s => s.classList.remove('hovered')));

    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reviewName').value.trim();
            const service = document.getElementById('reviewService').value;
            const text = document.getElementById('reviewText').value.trim();
            if (!name) { alert('الرجاء إدخال الاسم'); return; }
            if (selectedRating === 0) { alert('الرجاء تحديد التقييم'); return; }
            if (!text) { alert('الرجاء كتابة رأيك'); return; }
            const newR = { 
                id: Date.now(), 
                name, 
                role: service || 'عميل سعيد ✨',
                service: service || 'تغطية مناسبة 📸', 
                rating: selectedRating, 
                text, 
                date: new Date().toLocaleDateString('ar-SA'),
                icon: 'fa-heart'
            };
            const reviews = getUserReviews();
            reviews.unshift(newR);
            localStorage.setItem('nada_user_reviews', JSON.stringify(reviews));
            
            // Re-render slider to include new review at the start
            renderAllReviews();
            // Scroll slider to start to show the new review
            setTimeout(() => { if (sliderEl) sliderEl.scrollTo({ left: 0, behavior: 'smooth' }); }, 200);
            
            if (reviewSuccess) { reviewSuccess.style.display = 'flex'; setTimeout(() => reviewSuccess.style.display = 'none', 5000); }
            reviewForm.reset();
            selectedRating = 0;
            starsPicker.forEach(s => { s.classList.remove('selected'); s.classList.remove('hovered'); });
            if (starHint) { starHint.textContent = 'اضغط لاختيار التقييم'; starHint.style.color = ''; }
        });
    }

    // ===== 14. SHOPPING CART with COUPON + AUTO DISCOUNT =====
    let cart = JSON.parse(localStorage.getItem('nada_cart') || '[]');
    let appliedCoupon = null;
    
    const COUPONS = {
        'NADA15': { discount: 15, type: 'percent', label: 'كود NADA15 - خصم 15%' },
        'WELCOME10': { discount: 10, type: 'percent', label: 'كود ترحيبي - خصم 10%' },
        'SUMMER20': { discount: 20, type: 'percent', label: 'خصم الصيف 20%' }
    };

    const cartBtn = document.getElementById('floatingCart');
    const cartModal = document.getElementById('cartModal');
    const cartClose = document.getElementById('cartClose');
    const cartItemsEl = document.getElementById('cartItems');
    const cartCountEl = document.getElementById('cartCount');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartDiscountEl = document.getElementById('cartDiscount');
    const cartTotalEl = document.getElementById('cartTotal');
    const discountRowEl = document.getElementById('discountRow');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const couponInput = document.getElementById('couponInput');
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponMessage = document.getElementById('couponMessage');
    const autoDiscountBanner = document.getElementById('autoDiscountBanner');
    const autoDiscountText = document.getElementById('autoDiscountText');

    function calculateDiscount(subtotal, itemCount) {
        let autoPct = 0;
        let autoLabel = '';
        // Auto-discount based on number of packages
        if (itemCount >= 3) { autoPct = 15; autoLabel = '🎁 خصم تلقائي 15% عند اختيار 3 باقات!'; }
        else if (itemCount === 2) { autoPct = 10; autoLabel = '🎁 خصم تلقائي 10% عند اختيار باقتين!'; }
        
        let couponPct = 0;
        let couponLabel = '';
        if (appliedCoupon && COUPONS[appliedCoupon]) {
            couponPct = COUPONS[appliedCoupon].discount;
            couponLabel = COUPONS[appliedCoupon].label;
        }
        
        // Combine: use whichever is HIGHER (don't stack to avoid abuse, OR stack if desired)
        // We'll STACK them with cap of 35%
        const totalPct = Math.min(autoPct + couponPct, 35);
        const discountAmount = Math.floor(subtotal * totalPct / 100);
        
        return { autoPct, autoLabel, couponPct, couponLabel, totalPct, discountAmount };
    }

    function updateCart() {
        if (!cartCountEl) return;
        cartCountEl.textContent = cart.length;
        
        if (cart.length === 0) {
            if (cartItemsEl) cartItemsEl.innerHTML = '<p class="cart-empty">السلة فارغة 🛒</p>';
            if (cartSubtotalEl) cartSubtotalEl.textContent = '0';
            if (cartTotalEl) cartTotalEl.textContent = '0';
            if (discountRowEl) discountRowEl.style.display = 'none';
            if (autoDiscountBanner) autoDiscountBanner.style.display = 'none';
            localStorage.setItem('nada_cart', JSON.stringify(cart));
            return;
        }
        
        let subtotal = 0;
        cartItemsEl.innerHTML = cart.map((item, i) => {
            subtotal += parseInt(item.price);
            return '<div class="cart-item">' +
                '<div><strong>' + item.name + '</strong><br><span style="color: var(--accent-color);">' + item.price + ' ر.س</span></div>' +
                '<button class="cart-item-remove" data-idx="' + i + '">×</button>' +
                '</div>';
        }).join('');
        
        cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                cart.splice(parseInt(btn.dataset.idx), 1);
                updateCart();
            });
        });
        
        const calc = calculateDiscount(subtotal, cart.length);
        
        if (cartSubtotalEl) cartSubtotalEl.textContent = subtotal;
        
        if (calc.discountAmount > 0) {
            if (discountRowEl) discountRowEl.style.display = 'flex';
            if (cartDiscountEl) cartDiscountEl.textContent = calc.discountAmount;
        } else {
            if (discountRowEl) discountRowEl.style.display = 'none';
        }
        
        if (calc.autoPct > 0 && autoDiscountBanner) {
            autoDiscountBanner.style.display = 'flex';
            autoDiscountText.textContent = calc.autoLabel;
        } else if (autoDiscountBanner) {
            autoDiscountBanner.style.display = 'none';
        }
        
        if (cartTotalEl) cartTotalEl.textContent = subtotal - calc.discountAmount;
        
        localStorage.setItem('nada_cart', JSON.stringify(cart));
    }

    // Apply coupon
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', () => {
            const code = couponInput.value.trim().toUpperCase();
            if (!code) { couponMessage.textContent = 'الرجاء إدخال كود'; couponMessage.className = 'coupon-message error'; return; }
            if (COUPONS[code]) {
                appliedCoupon = code;
                couponMessage.textContent = '✓ تم تطبيق ' + COUPONS[code].label;
                couponMessage.className = 'coupon-message success';
                updateCart();
            } else {
                appliedCoupon = null;
                couponMessage.textContent = '✗ الكود غير صالح';
                couponMessage.className = 'coupon-message error';
                updateCart();
            }
        });
        couponInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); applyCouponBtn.click(); }
        });
    }

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            if (!name || !price) return;
            cart.push({ name, price });
            updateCart();
            if (cartBtn) {
                cartBtn.style.transform = 'scale(1.4)';
                setTimeout(() => cartBtn.style.transform = '', 300);
            }
            const originalText = btn.innerHTML;
            const originalBg = btn.style.background;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> تمت الإضافة ✓';
            btn.style.background = '#10b981';
            btn.style.borderColor = '#10b981';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = originalBg;
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 1800);
        });
    });

    if (cartBtn) cartBtn.addEventListener('click', () => { cartModal.classList.add('active'); document.body.style.overflow = 'hidden'; });
    if (cartClose) cartClose.addEventListener('click', () => { cartModal.classList.remove('active'); document.body.style.overflow = ''; });
    if (cartModal) cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) { cartModal.classList.remove('active'); document.body.style.overflow = ''; }
    });

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) { alert('السلة فارغة! أضف باقة أولاً'); return; }
            let subtotal = 0;
            cart.forEach(item => subtotal += parseInt(item.price));
            const calc = calculateDiscount(subtotal, cart.length);
            
            let msg = '*طلب حجز جلسة تصوير* 📸✨\n--------------------\n';
            cart.forEach(item => { msg += '• ' + item.name + ' - ' + item.price + ' ر.س\n'; });
            msg += '--------------------\n';
            msg += '💰 المجموع الفرعي: ' + subtotal + ' ر.س\n';
            if (calc.discountAmount > 0) {
                msg += '🎁 الخصم: -' + calc.discountAmount + ' ر.س (' + calc.totalPct + '%)\n';
                if (calc.autoLabel) msg += '   • ' + calc.autoLabel + '\n';
                if (calc.couponLabel) msg += '   • ' + calc.couponLabel + '\n';
            }
            msg += '*✅ الإجمالي: ' + (subtotal - calc.discountAmount) + ' ر.س*\n\nأود تأكيد الحجز.';
            window.open('https://wa.me/966551978419?text=' + encodeURIComponent(msg), '_blank');
        });
    }

    updateCart();

    // ===== 15. BOOKING FORM with DATE/TIME and FILE UPLOAD =====
    const refImagesInput = document.getElementById('refImages');
    const uploadPreview = document.getElementById('uploadPreview');
    let uploadedImages = [];

    if (refImagesInput) {
        refImagesInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (uploadedImages.length >= 5) {
                    alert('الحد الأقصى 5 صور');
                    return;
                }
                if (!file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const id = Date.now() + Math.random();
                    uploadedImages.push({ id, name: file.name, data: ev.target.result });
                    renderPreview();
                };
                reader.readAsDataURL(file);
            });
            refImagesInput.value = '';
        });
    }

    function renderPreview() {
        if (!uploadPreview) return;
        uploadPreview.innerHTML = uploadedImages.map(img => 
            '<div class="upload-preview-item">' +
            '<img src="' + img.data + '" alt="' + escHtml(img.name) + '">' +
            '<button type="button" class="upload-preview-remove" data-id="' + img.id + '">×</button>' +
            '</div>'
        ).join('');
        uploadPreview.querySelectorAll('.upload-preview-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseFloat(btn.dataset.id);
                uploadedImages = uploadedImages.filter(img => img.id !== id);
                renderPreview();
            });
        });
    }

    // Set min date to today for booking
    const bookingDate = document.getElementById('bookingDate');
    if (bookingDate) {
        const today = new Date().toISOString().split('T')[0];
        bookingDate.setAttribute('min', today);
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phoneNumber').value.trim();
            const service = document.getElementById('bookingService');
            const serviceText = service.options[service.selectedIndex].text;
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;
            const message = document.getElementById('message').value.trim();
            
            // Format date in Arabic
            let formattedDate = date;
            if (date) {
                try {
                    const d = new Date(date);
                    formattedDate = d.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                } catch(e){}
            }
            
            let waMsg = '*طلب حجز جلسة تصوير جديدة* 📸✨\n--------------------\n';
            waMsg += '*الاسم:* ' + name + '\n';
            waMsg += '*البريد:* ' + email + '\n';
            waMsg += '*الجوال:* ' + phone + '\n';
            waMsg += '*الخدمة:* ' + serviceText + '\n';
            waMsg += '*تاريخ الجلسة:* ' + formattedDate + '\n';
            waMsg += '*وقت الجلسة:* ' + time + '\n';
            if (uploadedImages.length > 0) {
                waMsg += '*صور مرجعية:* ' + uploadedImages.length + ' صور مرفقة 📷\n';
            }
            waMsg += '--------------------\n*تفاصيل إضافية:*\n' + message;
            if (uploadedImages.length > 0) {
                waMsg += '\n\n📌 سأرسل لكِ الصور المرجعية في رسالة منفصلة عبر واتساب.';
            }
            
            window.open('https://wa.me/966551978419?text=' + encodeURIComponent(waMsg), '_blank');
            
            // Reset
            contactForm.reset();
            uploadedImages = [];
            renderPreview();
        });
    }



    // ===== 16. V4: SECRET ADMIN PANEL TRIGGER =====
    // Type 'سند' or 'admin' anywhere on the page to open admin panel
    const ADMIN_PASSWORD = 'nada2026';  // المالك يمكنه تعديل كلمة المرور هنا
    const SECRET_TRIGGERS = ['سند', 'admin', 'ادمن'];
    let keyBuffer = '';
    let bufferTimeout = null;

    document.addEventListener('keydown', (e) => {
        // Skip if user is typing in input/textarea (avoid accidental triggers)
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if (e.key.length === 1) {
            keyBuffer += e.key;
            if (keyBuffer.length > 30) keyBuffer = keyBuffer.slice(-30);
            if (bufferTimeout) clearTimeout(bufferTimeout);
            bufferTimeout = setTimeout(() => { keyBuffer = ''; }, 3000);
            for (const trigger of SECRET_TRIGGERS) {
                if (keyBuffer.includes(trigger)) {
                    keyBuffer = '';
                    openAdminPanel();
                    break;
                }
            }
        }
    });

    // Also: triple-click on logo or 5 quick clicks anywhere on footer copyright opens admin
    let logoClicks = 0;
    let logoClickTimer = null;
    const logoEl = document.querySelector('.logo');
    if (logoEl) {
        logoEl.addEventListener('click', (e) => {
            logoClicks++;
            if (logoClickTimer) clearTimeout(logoClickTimer);
            logoClickTimer = setTimeout(() => { logoClicks = 0; }, 1500);
            if (logoClicks >= 5) {
                e.preventDefault();
                logoClicks = 0;
                openAdminPanel();
            }
        });
    }

    const adminPanel = document.getElementById('adminPanel');
    const adminLogin = document.getElementById('adminLogin');
    const adminDashboard = document.getElementById('adminDashboard');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminLoginError = document.getElementById('adminLoginError');

    function openAdminPanel() {
        if (adminPanel) {
            adminPanel.classList.add('active');
            adminLogin.style.display = 'flex';
            adminDashboard.style.display = 'none';
            adminPasswordInput.value = '';
            adminLoginError.textContent = '';
            setTimeout(() => adminPasswordInput.focus(), 100);
            document.body.style.overflow = 'hidden';
        }
    }
    function closeAdminPanel() {
        if (adminPanel) {
            adminPanel.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function tryAdminLogin() {
        const pwd = adminPasswordInput.value.trim();
        if (pwd === ADMIN_PASSWORD) {
            adminLogin.style.display = 'none';
            adminDashboard.style.display = 'block';
            renderPackagesList();
            renderReviewsList();
            renderReceiptsList();
        } else {
            adminLoginError.textContent = '✗ كلمة المرور غير صحيحة';
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    }

    document.getElementById('adminLoginBtn')?.addEventListener('click', tryAdminLogin);
    adminPasswordInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') tryAdminLogin(); });
    document.getElementById('adminLoginCancel')?.addEventListener('click', closeAdminPanel);
    document.getElementById('adminClose')?.addEventListener('click', closeAdminPanel);

    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const section = tab.dataset.section;
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            document.querySelector(`.admin-section[data-section="${section}"]`)?.classList.add('active');
        });
    });

    // ===== 17. V4: PACKAGES MANAGEMENT =====
    const defaultPackages = [
        { id: 'p1', name: 'الباقة الأساسية', price: 800, icon: 'fa-camera', desc: 'مناسبة للجلسات القصيرة والمناسبات الصغيرة', features: ['تصوير لمدة ساعتين', '30 صورة معدّلة احترافياً', 'تسليم خلال 5 أيام', 'صور رقمية عالية الدقة'], featured: false },
        { id: 'p2', name: 'الباقة الفضية', price: 1800, icon: 'fa-ring', desc: 'مثالية لحفلات الخطوبة والمناسبات المتوسطة', features: ['تصوير لمدة 4 ساعات', '80 صورة معدّلة سينمائياً', 'فيديو قصير (1 دقيقة)', 'تسليم خلال 3 أيام', 'جلسة تصوير ثنائية مجانية'], featured: true },
        { id: 'p3', name: 'الباقة الذهبية', price: 3500, icon: 'fa-crown', desc: 'تغطية شاملة لحفلات الزفاف الكبرى', features: ['تغطية كاملة ليوم الزفاف', '200+ صورة معدّلة فاخرة', 'فيديو احترافي (3-5 دقائق)', 'ألبوم زفاف مطبوع فاخر', 'تسليم خلال 7 أيام', 'مصورة مساعدة'], featured: false }
    ];

    function getPackages() {
        try {
            const stored = localStorage.getItem('nada_packages');
            return stored ? JSON.parse(stored) : defaultPackages;
        } catch(e) { return defaultPackages; }
    }
    function savePackages(pkgs) {
        localStorage.setItem('nada_packages', JSON.stringify(pkgs));
        renderPackagesList();
        renderPricingSection();
    }

    function renderPackagesList() {
        const listEl = document.getElementById('packagesList');
        if (!listEl) return;
        const pkgs = getPackages();
        if (pkgs.length === 0) {
            listEl.innerHTML = '<div class="admin-empty">لا توجد باقات حالياً</div>';
            return;
        }
        listEl.innerHTML = pkgs.map(p => `
            <div class="admin-item">
                <div class="admin-item-header">
                    <div class="admin-item-title"><i class="fa-solid ${p.icon}" style="color:var(--accent-color);margin-left:8px;"></i>${escHtml(p.name)} ${p.featured ? '⭐' : ''}</div>
                    <div class="admin-item-actions">
                        <button class="admin-btn-sm admin-btn-edit" data-pkg-edit="${p.id}">✏️ تعديل</button>
                        <button class="admin-btn-sm admin-btn-del" data-pkg-del="${p.id}">🗑️ حذف</button>
                    </div>
                </div>
                <div class="admin-item-meta">السعر: <span>${p.price} ر.س</span> · ${p.features.length} مميزات</div>
                <div class="admin-item-meta" style="margin-top:5px;">${escHtml(p.desc)}</div>
            </div>
        `).join('');
        listEl.querySelectorAll('[data-pkg-edit]').forEach(btn => {
            btn.addEventListener('click', () => editPackage(btn.dataset.pkgEdit));
        });
        listEl.querySelectorAll('[data-pkg-del]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
                    const pkgs = getPackages().filter(p => p.id !== btn.dataset.pkgDel);
                    savePackages(pkgs);
                }
            });
        });
    }

    function editPackage(id) {
        const pkg = getPackages().find(p => p.id === id);
        if (!pkg) return;
        document.getElementById('packageEditId').value = pkg.id;
        document.getElementById('packageName').value = pkg.name;
        document.getElementById('packagePrice').value = pkg.price;
        document.getElementById('packageIcon').value = pkg.icon;
        document.getElementById('packageDesc').value = pkg.desc;
        document.getElementById('packageFeatures').value = pkg.features.join('\n');
        document.getElementById('packageFeatured').checked = pkg.featured;
        document.getElementById('packageForm').style.display = 'flex';
    }

    document.getElementById('addPackageBtn')?.addEventListener('click', () => {
        document.getElementById('packageEditId').value = '';
        document.getElementById('packageName').value = '';
        document.getElementById('packagePrice').value = '';
        document.getElementById('packageIcon').value = 'fa-camera';
        document.getElementById('packageDesc').value = '';
        document.getElementById('packageFeatures').value = '';
        document.getElementById('packageFeatured').checked = false;
        document.getElementById('packageForm').style.display = 'flex';
    });

    document.getElementById('cancelPackageBtn')?.addEventListener('click', () => {
        document.getElementById('packageForm').style.display = 'none';
    });

    document.getElementById('savePackageBtn')?.addEventListener('click', () => {
        const id = document.getElementById('packageEditId').value || 'p' + Date.now();
        const name = document.getElementById('packageName').value.trim();
        const price = parseInt(document.getElementById('packagePrice').value);
        const icon = document.getElementById('packageIcon').value;
        const desc = document.getElementById('packageDesc').value.trim();
        const features = document.getElementById('packageFeatures').value.split('\n').map(s => s.trim()).filter(s => s);
        const featured = document.getElementById('packageFeatured').checked;
        if (!name || !price) { alert('الرجاء إدخال الاسم والسعر'); return; }
        let pkgs = getPackages();
        if (featured) pkgs = pkgs.map(p => ({...p, featured: false}));
        const existing = pkgs.findIndex(p => p.id === id);
        const newPkg = { id, name, price, icon, desc, features, featured };
        if (existing >= 0) pkgs[existing] = newPkg;
        else pkgs.push(newPkg);
        savePackages(pkgs);
        document.getElementById('packageForm').style.display = 'none';
    });

    function renderPricingSection() {
        const grid = document.querySelector('.pricing-grid');
        if (!grid) return;
        const pkgs = getPackages();
        grid.innerHTML = pkgs.map(p => `
            <div class="pricing-card${p.featured ? ' featured' : ''}">
                ${p.featured ? '<div class="pricing-badge">الأكثر طلباً ⭐</div>' : ''}
                <div class="pricing-header">
                    <i class="fa-solid ${p.icon}"></i>
                    <h3>${escHtml(p.name)}</h3>
                    <p>${escHtml(p.desc)}</p>
                </div>
                <div class="pricing-price">
                    <span class="currency">ر.س</span>
                    <span class="amount">${p.price}</span>
                </div>
                <ul class="pricing-features">
                    ${p.features.map(f => `<li><i class="fa-solid fa-check"></i> ${escHtml(f)}</li>`).join('')}
                </ul>
                <button class="btn ${p.featured ? 'btn-primary' : 'btn-outline'} add-to-cart-btn" data-name="${escHtml(p.name)}" data-price="${p.price}">
                    <i class="fa-solid fa-cart-plus"></i> أضف إلى السلة
                </button>
            </div>
        `).join('');
        // Re-bind add-to-cart on new buttons
        grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const name = btn.getAttribute('data-name');
                const price = btn.getAttribute('data-price');
                if (!name || !price) return;
                cart.push({ name, price });
                updateCart();
                if (cartBtn) { cartBtn.style.transform = 'scale(1.4)'; setTimeout(() => cartBtn.style.transform = '', 300); }
                const originalText = btn.innerHTML;
                const originalBg = btn.style.background;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> تمت الإضافة ✓';
                btn.style.background = '#10b981';
                btn.style.borderColor = '#10b981';
                btn.style.color = '#fff';
                setTimeout(() => { btn.innerHTML = originalText; btn.style.background = originalBg; btn.style.borderColor = ''; btn.style.color = ''; }, 1800);
            });
        });
    }

    // Initial render of pricing from stored packages (in case admin already added)
    if (localStorage.getItem('nada_packages')) renderPricingSection();

    // ===== 18. V4: REVIEWS MANAGEMENT =====
    function renderReviewsList() {
        const listEl = document.getElementById('reviewsList');
        if (!listEl) return;
        const userReviews = getUserReviews();
        const allReviews = [...userReviews, ...defaultReviews.map((r, i) => ({ ...r, id: 'default_' + i, isDefault: true }))];
        if (allReviews.length === 0) {
            listEl.innerHTML = '<div class="admin-empty">لا توجد آراء حالياً</div>';
            return;
        }
        listEl.innerHTML = allReviews.map(r => `
            <div class="admin-item">
                <div class="admin-item-header">
                    <div class="admin-item-title">${escHtml(r.name)} ${r.isDefault ? '<span style="font-size:0.7rem;color:var(--text-muted);">(افتراضي)</span>' : '<span style="font-size:0.7rem;color:#10b981;">(مستخدم)</span>'}</div>
                    <div class="admin-item-actions">
                        ${!r.isDefault ? `<button class="admin-btn-sm admin-btn-del" data-rev-del="${r.id}">🗑️ حذف</button>` : ''}
                    </div>
                </div>
                <div class="admin-item-meta"><span>⭐ ${r.rating}</span> · ${escHtml(r.service || r.role || '')}</div>
                <div class="admin-item-meta" style="margin-top:5px;color:var(--text-gray);">"${escHtml(r.text)}"</div>
            </div>
        `).join('');
        listEl.querySelectorAll('[data-rev-del]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من حذف هذا الرأي؟')) {
                    const id = parseFloat(btn.dataset.revDel);
                    const reviews = getUserReviews().filter(r => r.id !== id);
                    localStorage.setItem('nada_user_reviews', JSON.stringify(reviews));
                    renderReviewsList();
                    renderAllReviews();
                }
            });
        });
    }

    // ===== 19. V4: RECEIPT SYSTEM =====
    function getReceipts() {
        try {
            const stored = localStorage.getItem('nada_receipts');
            return stored ? JSON.parse(stored) : [];
        } catch(e) { return []; }
    }
    function saveReceipts(receipts) {
        localStorage.setItem('nada_receipts', JSON.stringify(receipts));
    }

    function renderReceiptsList() {
        const listEl = document.getElementById('receiptsList');
        if (!listEl) return;
        const receipts = getReceipts();
        if (receipts.length === 0) {
            listEl.innerHTML = '<div class="admin-empty">لا توجد سندات قبض حالياً. اضغط "سند قبض جديد" للبدء</div>';
            return;
        }
        listEl.innerHTML = receipts.slice().reverse().map(r => `
            <div class="receipt-list-item" data-rcv-view="${r.id}">
                <div class="receipt-list-info">
                    <strong>#${r.number} - ${escHtml(r.clientName)}</strong>
                    <small>${r.date} · ${escHtml(r.service)} · ${r.type === 'full' ? '💰 كامل' : '📝 عربون'}</small>
                </div>
                <div class="receipt-list-amount">${r.paidAmount} ر.س</div>
            </div>
        `).join('');
        listEl.querySelectorAll('[data-rcv-view]').forEach(item => {
            item.addEventListener('click', () => viewReceipt(item.dataset.rcvView));
        });
    }

    const receiptModal = document.getElementById('receiptModal');
    const receiptFormView = document.getElementById('receiptFormView');
    const receiptPreviewView = document.getElementById('receiptPreviewView');
    const printableReceipt = document.getElementById('printableReceipt');

    function openReceiptModal() {
        if (receiptModal) {
            receiptModal.classList.add('active');
            receiptFormView.style.display = 'block';
            receiptPreviewView.style.display = 'none';
            // Reset form
            document.getElementById('rcvClientName').value = '';
            document.getElementById('rcvClientPhone').value = '';
            document.getElementById('rcvService').value = '';
            document.getElementById('rcvTotalAmount').value = '';
            document.getElementById('rcvPaidAmount').value = '';
            document.getElementById('rcvType').value = 'full';
            document.getElementById('rcvNotes').value = '';
            document.getElementById('rcvEventDate').value = '';
        }
    }
    function closeReceiptModal() {
        receiptModal?.classList.remove('active');
    }

    document.getElementById('createReceiptBtn')?.addEventListener('click', openReceiptModal);
    document.getElementById('receiptClose')?.addEventListener('click', closeReceiptModal);
    document.getElementById('cancelReceiptBtn')?.addEventListener('click', closeReceiptModal);
    document.getElementById('backToFormBtn')?.addEventListener('click', () => {
        receiptPreviewView.style.display = 'none';
        receiptFormView.style.display = 'block';
    });

    // Auto-fill paid amount when type changes to 'full'
    document.getElementById('rcvType')?.addEventListener('change', (e) => {
        if (e.target.value === 'full') {
            const total = document.getElementById('rcvTotalAmount').value;
            if (total) document.getElementById('rcvPaidAmount').value = total;
        }
    });

    function generateReceiptHTML(data) {
        const remaining = data.totalAmount - data.paidAmount;
        const typeLabel = data.type === 'full' ? 'سند قبض كامل' : 'سند عربون';
        return `
            <div class="receipt-header-print">
                <div class="logo-mark"><span style="color:#000;">N</span>ADA</div>
                <div class="business-name">المصورة ندى</div>
                <div class="business-sub">تصوير الأعراس والمناسبات · بيشة</div>
            </div>
            <div class="receipt-title-bar">${typeLabel} رقم #${data.number}</div>
            <div class="receipt-meta-grid">
                <div><strong>العميل:</strong> ${escHtml(data.clientName)}</div>
                <div><strong>الجوال:</strong> ${escHtml(data.clientPhone)}</div>
                <div><strong>التاريخ:</strong> ${data.date}</div>
                <div><strong>تاريخ المناسبة:</strong> ${data.eventDate || '-'}</div>
            </div>
            <div class="receipt-body">
                <table>
                    <tr><th>البيان</th><th>القيمة</th></tr>
                    <tr><td>${escHtml(data.service)}</td><td>${data.totalAmount} ر.س</td></tr>
                    <tr><td>طريقة الدفع</td><td>${escHtml(data.paymentMethod)}</td></tr>
                </table>
                <div class="receipt-summary">
                    <div class="receipt-summary-row"><span>المبلغ الإجمالي:</span><span>${data.totalAmount} ر.س</span></div>
                    <div class="receipt-summary-row paid"><span>المبلغ المستلم:</span><span>${data.paidAmount} ر.س</span></div>
                    ${data.type === 'deposit' && remaining > 0 ? `<div class="receipt-summary-row remaining"><span>المبلغ المتبقي:</span><span>${remaining} ر.س</span></div>` : ''}
                    <div class="receipt-summary-row total"><span>الحالة:</span><span>${data.type === 'full' ? '✓ مدفوع بالكامل' : '⏳ عربون'}</span></div>
                </div>
                ${data.notes ? `<p style="margin-top:15px;padding:10px;background:#f9f9f9;border-radius:6px;color:#000;font-size:0.85rem;"><strong>ملاحظات:</strong> ${escHtml(data.notes)}</p>` : ''}
            </div>
            <div class="receipt-signature">
                <div>توقيع المستلم</div>
                <div>
                    توقيع الإدارة
                    <div class="receipt-stamp" style="margin-top:5px;font-size:0.75rem;">N · NADA</div>
                </div>
            </div>
            <div class="receipt-footer-print">
                شكراً لثقتكم بنا 💖 · للتواصل: 0551978419
                <br><small style="color:#999;">© ${new Date().getFullYear()} المصورة ندى</small>
            </div>
        `;
    }

    document.getElementById('generateReceiptBtn')?.addEventListener('click', () => {
        const clientName = document.getElementById('rcvClientName').value.trim();
        const clientPhone = document.getElementById('rcvClientPhone').value.trim();
        const service = document.getElementById('rcvService').value.trim();
        const totalAmount = parseInt(document.getElementById('rcvTotalAmount').value) || 0;
        const paidAmount = parseInt(document.getElementById('rcvPaidAmount').value) || 0;
        const type = document.getElementById('rcvType').value;
        const paymentMethod = document.getElementById('rcvPaymentMethod').value;
        const eventDate = document.getElementById('rcvEventDate').value;
        const notes = document.getElementById('rcvNotes').value.trim();

        if (!clientName || !service || !totalAmount || !paidAmount) {
            alert('الرجاء تعبئة الحقول المطلوبة');
            return;
        }

        const receipts = getReceipts();
        const number = String(receipts.length + 1).padStart(4, '0');
        const today = new Date();
        const dateStr = today.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
        let eventDateFormatted = '';
        if (eventDate) {
            try { eventDateFormatted = new Date(eventDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }); }
            catch(e) { eventDateFormatted = eventDate; }
        }

        const receipt = {
            id: 'r' + Date.now(),
            number, clientName, clientPhone, service,
            totalAmount, paidAmount, type, paymentMethod,
            eventDate: eventDateFormatted, notes,
            date: dateStr, timestamp: today.getTime()
        };
        receipts.push(receipt);
        saveReceipts(receipts);

        // Show preview
        printableReceipt.innerHTML = generateReceiptHTML(receipt);
        receiptFormView.style.display = 'none';
        receiptPreviewView.style.display = 'block';
        renderReceiptsList();
    });

    function viewReceipt(id) {
        const receipt = getReceipts().find(r => r.id === id);
        if (!receipt) return;
        printableReceipt.innerHTML = generateReceiptHTML(receipt);
        receiptModal.classList.add('active');
        receiptFormView.style.display = 'none';
        receiptPreviewView.style.display = 'block';
    }

    // Print
    document.getElementById('printReceiptBtn')?.addEventListener('click', () => {
        window.print();
    });

    // Save as Image (using html2canvas)
    document.getElementById('saveImageBtn')?.addEventListener('click', async () => {
        if (typeof html2canvas === 'undefined') { alert('مكتبة html2canvas غير محملة'); return; }
        try {
            const canvas = await html2canvas(printableReceipt, { backgroundColor: '#ffffff', scale: 2 });
            const link = document.createElement('a');
            link.download = `receipt_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch(e) { alert('حدث خطأ في حفظ الصورة'); console.error(e); }
    });

    // Save as PDF (using jsPDF + html2canvas)
    document.getElementById('savePdfBtn')?.addEventListener('click', async () => {
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') { alert('المكتبات غير محملة'); return; }
        try {
            const canvas = await html2canvas(printableReceipt, { backgroundColor: '#ffffff', scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgRatio = canvas.height / canvas.width;
            const imgWidth = pdfWidth - 20;
            const imgHeight = imgWidth * imgRatio;
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));
            pdf.save(`receipt_${Date.now()}.pdf`);
        } catch(e) { alert('حدث خطأ في حفظ PDF'); console.error(e); }
    });



    // ===== 20. V5: BOOKINGS MANAGEMENT =====
    function getBookings() {
        try {
            const s = localStorage.getItem('nada_bookings');
            return s ? JSON.parse(s) : [];
        } catch(e) { return []; }
    }
    function saveBookings(b) {
        localStorage.setItem('nada_bookings', JSON.stringify(b));
        updateBookingsBadge();
    }
    function updateBookingsBadge() {
        const badge = document.getElementById('bookingsBadge');
        if (!badge) return;
        const newCount = getBookings().filter(b => b.status === 'new').length;
        badge.textContent = newCount > 0 ? newCount : '';
    }

    // Override contactForm submit to ALSO save booking locally
    const contactFormV5 = document.getElementById('contactForm');
    if (contactFormV5) {
        // Remove existing listeners by cloning
        const newForm = contactFormV5.cloneNode(true);
        contactFormV5.parentNode.replaceChild(newForm, contactFormV5);

        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phoneNumber').value.trim();
            const service = document.getElementById('bookingService');
            const serviceText = service.options[service.selectedIndex].text;
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;
            const message = document.getElementById('message').value.trim();

            let formattedDate = date;
            if (date) {
                try {
                    const d = new Date(date);
                    formattedDate = d.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                } catch(err){}
            }

            // Save booking locally
            const booking = {
                id: 'b' + Date.now(),
                name, email, phone, service: serviceText,
                date, dateFormatted: formattedDate, time, message,
                images: uploadedImages.map(img => ({ name: img.name, data: img.data })),
                status: 'new',
                receivedAt: new Date().toISOString(),
                receivedAtFormatted: new Date().toLocaleString('ar-SA')
            };
            const bookings = getBookings();
            bookings.unshift(booking);
            saveBookings(bookings);

            // Send to WhatsApp
            let waMsg = '*طلب حجز جلسة تصوير جديدة* 📸✨\n--------------------\n';
            waMsg += '*الاسم:* ' + name + '\n';
            waMsg += '*البريد:* ' + email + '\n';
            waMsg += '*الجوال:* ' + phone + '\n';
            waMsg += '*الخدمة:* ' + serviceText + '\n';
            waMsg += '*تاريخ الجلسة:* ' + formattedDate + '\n';
            waMsg += '*وقت الجلسة:* ' + time + '\n';
            if (uploadedImages.length > 0) {
                waMsg += '*صور مرجعية:* ' + uploadedImages.length + ' صور مرفقة 📷\n';
            }
            waMsg += '--------------------\n*تفاصيل إضافية:*\n' + message;
            if (uploadedImages.length > 0) {
                waMsg += '\n\n📌 سأرسل لكِ الصور المرجعية في رسالة منفصلة عبر واتساب.';
            }

            window.open('https://wa.me/966551978419?text=' + encodeURIComponent(waMsg), '_blank');

            newForm.reset();
            uploadedImages = [];
            renderPreview();

            alert('✅ تم استلام طلبكِ! سيتم التواصل معكِ قريباً.');
        });
    }

    let currentBookingFilter = 'all';

    function renderBookingsList() {
        const listEl = document.getElementById('bookingsList');
        const statsEl = document.getElementById('bookingsStats');
        if (!listEl) return;

        const all = getBookings();

        // Stats
        const stats = {
            all: all.length,
            new: all.filter(b => b.status === 'new').length,
            contacted: all.filter(b => b.status === 'contacted').length,
            confirmed: all.filter(b => b.status === 'confirmed').length,
            completed: all.filter(b => b.status === 'completed').length,
            cancelled: all.filter(b => b.status === 'cancelled').length
        };
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="booking-stat"><div class="booking-stat-num">${stats.all}</div><div class="booking-stat-label">الكل</div></div>
                <div class="booking-stat"><div class="booking-stat-num" style="color:#ef4444;">${stats.new}</div><div class="booking-stat-label">جديد</div></div>
                <div class="booking-stat"><div class="booking-stat-num" style="color:#f59e0b;">${stats.contacted}</div><div class="booking-stat-label">تم التواصل</div></div>
                <div class="booking-stat"><div class="booking-stat-num" style="color:#10b981;">${stats.confirmed}</div><div class="booking-stat-label">مؤكد</div></div>
                <div class="booking-stat"><div class="booking-stat-num" style="color:#3b82f6;">${stats.completed}</div><div class="booking-stat-label">منتهي</div></div>
            `;
        }

        let filtered = all;
        if (currentBookingFilter !== 'all') {
            filtered = all.filter(b => b.status === currentBookingFilter);
        }

        if (filtered.length === 0) {
            listEl.innerHTML = '<div class="admin-empty">لا توجد حجوزات في هذه الفئة</div>';
            return;
        }

        const statusLabels = {
            new: { label: 'جديد', icon: 'fa-circle', cls: 'new' },
            contacted: { label: 'تم التواصل', icon: 'fa-phone', cls: 'contacted' },
            confirmed: { label: 'مؤكد', icon: 'fa-check', cls: 'confirmed' },
            completed: { label: 'منتهي', icon: 'fa-flag-checkered', cls: 'completed' },
            cancelled: { label: 'ملغي', icon: 'fa-xmark', cls: 'cancelled' }
        };

        listEl.innerHTML = filtered.map(b => {
            const st = statusLabels[b.status] || statusLabels.new;
            const imgs = (b.images || []).map(img =>
                `<img src="${img.data}" alt="${escHtml(img.name)}" data-bimg="${img.data}">`
            ).join('');
            const phoneClean = (b.phone || '').replace(/\D/g, '');
            const phoneWA = phoneClean.startsWith('0') ? '966' + phoneClean.substring(1) : (phoneClean.startsWith('966') ? phoneClean : '966' + phoneClean);
            return `
                <div class="booking-card status-${b.status}">
                    <div class="booking-card-top">
                        <div class="booking-client-info">
                            <strong>${escHtml(b.name)}</strong>
                            <small>📅 ${escHtml(b.receivedAtFormatted || '-')}</small>
                        </div>
                        <span class="booking-status-badge status-badge-${st.cls}"><i class="fa-solid ${st.icon}"></i> ${st.label}</span>
                    </div>
                    <div class="booking-details">
                        <div><i class="fa-solid fa-phone"></i> ${escHtml(b.phone)}</div>
                        <div><i class="fa-solid fa-envelope"></i> ${escHtml(b.email)}</div>
                        <div><i class="fa-solid fa-camera"></i> ${escHtml(b.service)}</div>
                        <div><i class="fa-solid fa-calendar-day"></i> ${escHtml(b.dateFormatted || b.date || '-')}</div>
                        <div><i class="fa-solid fa-clock"></i> ${escHtml(b.time || '-')}</div>
                    </div>
                    ${b.message ? `<div class="booking-message">💬 ${escHtml(b.message)}</div>` : ''}
                    ${imgs ? `<div class="booking-images">${imgs}</div>` : ''}
                    <div class="booking-actions">
                        <a class="booking-action-btn booking-btn-wa" href="https://wa.me/${phoneWA}" target="_blank"><i class="fab fa-whatsapp"></i> واتساب</a>
                        <a class="booking-action-btn booking-btn-call" href="tel:${escHtml(b.phone)}"><i class="fa-solid fa-phone"></i> اتصال</a>
                        <button class="booking-action-btn booking-btn-receipt" data-book-receipt="${b.id}"><i class="fa-solid fa-receipt"></i> سند</button>
                        <div class="booking-status-menu">
                            <button class="booking-action-btn booking-btn-status" data-book-status="${b.id}"><i class="fa-solid fa-rotate"></i> تغيير الحالة</button>
                            <div class="booking-status-options" data-options="${b.id}">
                                <button data-set-status="new" data-id="${b.id}">🔴 جديد</button>
                                <button data-set-status="contacted" data-id="${b.id}">🟠 تم التواصل</button>
                                <button data-set-status="confirmed" data-id="${b.id}">🟢 مؤكد</button>
                                <button data-set-status="completed" data-id="${b.id}">🔵 منتهي</button>
                                <button data-set-status="cancelled" data-id="${b.id}">⚫ ملغي</button>
                            </div>
                        </div>
                        <button class="booking-action-btn booking-btn-del" data-book-del="${b.id}"><i class="fa-solid fa-trash"></i> حذف</button>
                    </div>
                </div>
            `;
        }).join('');

        // Bind events
        listEl.querySelectorAll('[data-book-status]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.bookStatus;
                document.querySelectorAll('.booking-status-options').forEach(opt => {
                    if (opt.dataset.options === id) opt.classList.toggle('active');
                    else opt.classList.remove('active');
                });
            });
        });
        listEl.querySelectorAll('[data-set-status]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const newStatus = btn.dataset.setStatus;
                const bookings = getBookings().map(b => b.id === id ? { ...b, status: newStatus } : b);
                saveBookings(bookings);
                renderBookingsList();
            });
        });
        listEl.querySelectorAll('[data-book-del]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
                    const bookings = getBookings().filter(b => b.id !== btn.dataset.bookDel);
                    saveBookings(bookings);
                    renderBookingsList();
                }
            });
        });
        listEl.querySelectorAll('[data-book-receipt]').forEach(btn => {
            btn.addEventListener('click', () => {
                const booking = getBookings().find(b => b.id === btn.dataset.bookReceipt);
                if (!booking) return;
                openReceiptModal();
                document.getElementById('rcvClientName').value = booking.name || '';
                document.getElementById('rcvClientPhone').value = booking.phone || '';
                document.getElementById('rcvService').value = booking.service || '';
                if (booking.date) document.getElementById('rcvEventDate').value = booking.date;
            });
        });
        listEl.querySelectorAll('[data-bimg]').forEach(img => {
            img.addEventListener('click', () => openImgZoom(img.dataset.bimg));
        });
    }

    function openImgZoom(src) {
        let z = document.querySelector('.booking-img-zoom');
        if (!z) {
            z = document.createElement('div');
            z.className = 'booking-img-zoom';
            z.innerHTML = '<img alt="صورة مرجعية">';
            z.addEventListener('click', () => z.classList.remove('active'));
            document.body.appendChild(z);
        }
        z.querySelector('img').src = src;
        z.classList.add('active');
    }

    // Booking filter buttons
    document.querySelectorAll('.booking-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.booking-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBookingFilter = btn.dataset.filter;
            renderBookingsList();
        });
    });

    // Hook into tab switch - render bookings when bookings tab opens
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.dataset.section === 'bookings') renderBookingsList();
        });
    });

    // Initialize badge on load
    updateBookingsBadge();

    // ===== 21. V5: SEND RECEIPT VIA WHATSAPP =====
    let currentReceiptData = null;

    // Hook: capture currently-displayed receipt data when generated
    const originalGenerateBtn = document.getElementById('generateReceiptBtn');
    if (originalGenerateBtn) {
        originalGenerateBtn.addEventListener('click', () => {
            // After short delay, fetch the last receipt as currentReceiptData
            setTimeout(() => {
                const receipts = getReceipts();
                if (receipts.length > 0) {
                    currentReceiptData = receipts[receipts.length - 1];
                }
            }, 100);
        });
    }

    // Also: viewReceipt sets currentReceiptData
    const _origViewReceipt = window.viewReceipt;

    document.getElementById('sendWhatsappReceiptBtn')?.addEventListener('click', async () => {
        // Get current receipt: latest one OR matched by displayed content
        const receipts = getReceipts();
        let receipt = currentReceiptData || receipts[receipts.length - 1];
        if (!receipt) { alert('لا يوجد سند لإرساله'); return; }

        const phone = receipt.clientPhone;
        if (!phone) {
            if (!confirm('رقم الجوال غير محدد. هل تريد فتح واتساب يدوياً؟')) return;
        }
        const clean = (phone || '').replace(/\D/g, '');
        const waNum = clean.startsWith('0') ? '966' + clean.substring(1) : (clean.startsWith('966') ? clean : '966' + clean);

        const remaining = receipt.totalAmount - receipt.paidAmount;
        const typeLabel = receipt.type === 'full' ? '✅ سند قبض كامل' : '📝 سند عربون';

        let msg = '*' + typeLabel + '*\n';
        msg += 'من: المصورة ندى 📸\n';
        msg += '━━━━━━━━━━━━━━\n';
        msg += '*رقم السند:* #' + receipt.number + '\n';
        msg += '*التاريخ:* ' + receipt.date + '\n';
        msg += '*العميل:* ' + receipt.clientName + '\n';
        msg += '*الخدمة:* ' + receipt.service + '\n';
        if (receipt.eventDate) msg += '*تاريخ المناسبة:* ' + receipt.eventDate + '\n';
        msg += '━━━━━━━━━━━━━━\n';
        msg += '💰 *المبلغ الإجمالي:* ' + receipt.totalAmount + ' ر.س\n';
        msg += '✅ *المبلغ المستلم:* ' + receipt.paidAmount + ' ر.س\n';
        if (receipt.type === 'deposit' && remaining > 0) {
            msg += '⏳ *المتبقي:* ' + remaining + ' ر.س\n';
        }
        msg += '💳 *طريقة الدفع:* ' + receipt.paymentMethod + '\n';
        if (receipt.notes) msg += '📝 *ملاحظات:* ' + receipt.notes + '\n';
        msg += '━━━━━━━━━━━━━━\n';
        msg += 'شكراً لثقتكم بنا 💖\n';
        msg += 'للاستفسار: 0551978419';

        const url = waNum ? ('https://wa.me/' + waNum + '?text=' + encodeURIComponent(msg)) : ('https://wa.me/?text=' + encodeURIComponent(msg));
        window.open(url, '_blank');
    });

    // Modify generateReceiptBtn to also store current receipt + auto-prompt to send
    document.getElementById('generateReceiptBtn')?.addEventListener('click', () => {
        setTimeout(() => {
            const receipts = getReceipts();
            if (receipts.length > 0) currentReceiptData = receipts[receipts.length - 1];
        }, 200);
    });

    // viewReceipt should also set currentReceiptData
    // We need to intercept it; redefine viewReceipt
    const _viewReceipt = function(id) {
        const receipt = getReceipts().find(r => r.id === id);
        if (!receipt) return;
        currentReceiptData = receipt;
        printableReceipt.innerHTML = generateReceiptHTML(receipt);
        receiptModal.classList.add('active');
        receiptFormView.style.display = 'none';
        receiptPreviewView.style.display = 'block';
    };
    window.viewReceipt = _viewReceipt;

});