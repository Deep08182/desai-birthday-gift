document.addEventListener("DOMContentLoaded", () => {
    
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    /* =========================================
       1. Background Canvas Animation (Floating particles)
       ========================================= */
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height, particles;

    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 3 + 1,
                dx: (Math.random() - 0.5) * 0.5,
                dy: (Math.random() - 0.5) * 0.5 - 0.2 // drift upward
            });
        }
    }

    function animateCanvas() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(252, 213, 206, 0.5)'; // Blush pink with opacity
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.dx;
            p.y += p.dy;
            
            // Wrap around
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
        });
        requestAnimationFrame(animateCanvas);
    }
    initCanvas();
    animateCanvas();
    window.addEventListener('resize', initCanvas);

    /* =========================================
       2. Hero Section: Staggered Letters
       ========================================= */
    const heroTitle = document.getElementById('hero-title');
    const text = heroTitle.innerText;
    heroTitle.innerHTML = '';
    // Wrap each letter in a span
    text.split('').forEach(char => {
        let span = document.createElement('span');
        span.innerText = char === ' ' ? '\u00A0' : char; // preserve spaces
        heroTitle.appendChild(span);
    });

    gsap.to('.hero-title span', {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 0.5
    });

    /* =========================================
       3. Heart Click -> Polaroid Pop & Confetti
       ========================================= */
    const mainHeart = document.getElementById('main-heart');
    const polaroids = document.querySelectorAll('.polaroid');
    const restOfSite = document.getElementById('rest-of-site');
    let heartClicked = false;

    mainHeart.addEventListener('click', (e) => {
        if (heartClicked) return;
        heartClicked = true;

        // Add haptic feedback if supported by browser/device
        if (navigator.vibrate) navigator.vibrate(50);

        // Hide tap text
        gsap.to('#tap-text', { opacity: 0, duration: 0.3 });

        // Heart pulse and shrink
        let tl = gsap.timeline();
        tl.to(mainHeart, {
            scale: 1.5,
            duration: 0.2,
            ease: "power2.out"
        }).to(mainHeart, {
            scale: 0,
            opacity: 0,
            duration: 0.4,
            ease: "back.in(2)",
            onComplete: () => {
                // Fire confetti!
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.5 },
                    colors: ['#780000', '#FCD5CE', '#D4AF37']
                });

                // Pop out polaroids
                popPolaroids();
            }
        });
    });

    function popPolaroids() {
        // Show rest of the site wrapper but keep it opaque until polaroids are done
        restOfSite.style.display = 'block';

        gsap.to(polaroids, {
            scale: 1,
            opacity: 1,
            rotation: () => Math.random() * 40 - 20, // Random rotation between -20 and 20
            x: () => (Math.random() * 150 - 75), // Random X spread
            y: () => (Math.random() * 200 - 100), // Random Y spread
            stagger: 0.15,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)", // Spring bouncy effect
            onComplete: () => {
                // Wait a bit, then fade out polaroids and reveal the rest of the site smoothly
                setTimeout(() => {
                    gsap.to(polaroids, {
                        y: window.innerHeight,
                        opacity: 0,
                        stagger: 0.1,
                        duration: 0.8,
                        ease: "power2.in"
                    });
                    
                    gsap.to(restOfSite, {
                        opacity: 1,
                        duration: 1.5,
                        ease: "power2.inOut",
                        onComplete: initScrollAnimations
                    });
                }, 1500);
            }
        });
    }

    /* =========================================
       4. Swiper Carousel Init
       ========================================= */
    const swiper = new Swiper(".mySwiper", {
        effect: "cards",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        },
        cardsEffect: {
            slideShadows: true,
        }
    });

    /* =========================================
       5. Lightbox for Gallery
       ========================================= */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const slides = document.querySelectorAll('.swiper-slide img');

    slides.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
        });
    });

    const closeLightbox = () => lightbox.classList.remove('active');
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if(e.target === lightbox) closeLightbox();
    });

    // Swipe down to close lightbox (touch gesture)
    let touchstartY = 0;
    lightbox.addEventListener('touchstart', e => touchstartY = e.changedTouches[0].screenY);
    lightbox.addEventListener('touchend', e => {
        let touchendY = e.changedTouches[0].screenY;
        if (touchendY - touchstartY > 50) closeLightbox(); // Swipe down
    });


    /* =========================================
       6. Scroll Animations (Timeline & Messages)
       ========================================= */
    function initScrollAnimations() {
        // Timeline Glowing Line
        gsap.to(".timeline-progress", {
            scrollTrigger: {
                trigger: ".timeline-container",
                start: "top center",
                end: "bottom center",
                scrub: 1
            },
            height: "100%",
            ease: "none"
        });

        // Timeline Cards sliding in
        const timelineEvents = document.querySelectorAll('.timeline-event');
        timelineEvents.forEach((event, i) => {
            gsap.to(event, {
                scrollTrigger: {
                    trigger: event,
                    start: "top 85%",
                },
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: "back.out(1.5)"
            });
        });

        // Typewriter Effect trigger
        const messageText = `Happy Birthday! I wanted to create something special for you. Every moment with you is a treasure, and I look forward to creating countless more memories. You mean the world to me.`;
        const typewriterEl = document.getElementById('typewriter-text');
        
        ScrollTrigger.create({
            trigger: "#message",
            start: "top 70%",
            once: true,
            onEnter: () => {
                let i = 0;
                typewriterEl.innerHTML = "";
                function type() {
                    if (i < messageText.length) {
                        typewriterEl.innerHTML += messageText.charAt(i);
                        i++;
                        setTimeout(type, 40); // 40ms per letter
                    }
                }
                type();
            }
        });

        // Closing animation
        gsap.to(".closing-title", {
            scrollTrigger: {
                trigger: "#closing",
                start: "top 60%"
            },
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.out"
        });

        gsap.to(".closing-heart", {
            scrollTrigger: {
                trigger: "#closing",
                start: "top 60%"
            },
            opacity: 1,
            scale: 1.2,
            duration: 1,
            delay: 0.5,
            ease: "elastic.out(1, 0.3)"
        });
    }

    /* =========================================
       7. Background Music Toggle
       ========================================= */
    const musicBtn = document.getElementById('music-toggle');
    const musicIcon = musicBtn.querySelector('i');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicIcon.classList.remove('fa-pause');
            musicIcon.classList.add('fa-music');
        } else {
            bgMusic.play().catch(error => console.log("Audio not set"));
            musicIcon.classList.remove('fa-music');
            musicIcon.classList.add('fa-pause');
        }
        isPlaying = !isPlaying;
    });

});
