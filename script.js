// Main Romantic Website Class
class RomanticWebsite {
    constructor() {
        this.currentTab = 'home';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.hideLoadingScreen();
        this.initializeGalleries();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                const color = e.currentTarget.dataset.color;
                this.switchTab(tab, color);
            });
        });

        // Resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 2000);
        }
    }

    switchTab(tabName, color) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected tab
        const targetSection = document.getElementById(tabName);
        const targetNavItem = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }
        
        // Update background gradient
        if (color) {
            document.body.style.background = `linear-gradient(135deg, ${color} 0%, #1a1a2e 50%, #0f3460 100%)`;
        }
        
        this.currentTab = tabName;
        
        // Initialize galleries when switching tabs
        setTimeout(() => {
            this.initializeGalleries();
        }, 100);
    }

    initializeGalleries() {
        // Initialize memories gallery
        if (this.currentTab === 'memories') {
            if (window.memoriesGallery) {
                window.memoriesGallery = null;
            }
            window.memoriesGallery = new CleanMemoriesGallery();
        }
        
        // Initialize passion gallery
        if (this.currentTab === 'passion') {
            if (window.passionGallery) {
                window.passionGallery = null;
            }
            window.passionGallery = new SmoothMobilePassionGallery();
        }
    }

    handleResize() {
        // Handle responsive changes
        if (window.memoriesGallery) {
            window.memoriesGallery.handleResize();
        }
        if (window.passionGallery) {
            window.passionGallery.handleResize();
        }
    }
}

// Clean Memories Gallery
class CleanMemoriesGallery {
    constructor() {
        this.currentIndex = 0;
        this.totalCards = 6;
        this.isAnimating = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 50;
        this.isMobile = this.detectMobile();
        this.init();
    }

    detectMobile() {
        return window.innerWidth <= 768;
    }

    init() {
        this.setupEventListeners();
        this.updateCardPositions();
    }

    setupEventListeners() {
        // Button controls
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousCard());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextCard());

        // Indicator controls
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToCard(index));
        });

        // Touch/swipe events
        const carousel = document.getElementById('photoCarousel');
        if (carousel) {
            this.setupTouchEvents(carousel);
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('memories').classList.contains('active')) {
                this.handleKeyDown(e);
            }
        });
    }

    setupTouchEvents(carousel) {
        let startX = 0;
        let isDragging = false;

        carousel.addEventListener('touchstart', (e) => {
            if (this.isAnimating) return;
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging || this.isAnimating) return;
            
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            if (Math.abs(diff) > 10) {
                e.preventDefault();
            }
            
            this.updateSwipeFeedback(diff);
        }, { passive: false });

        carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            this.resetSwipeFeedback();
            
            if (Math.abs(diff) > this.minSwipeDistance) {
                if (diff > 0) {
                    this.nextCard();
                } else {
                    this.previousCard();
                }
            }
        }, { passive: true });
    }

    updateSwipeFeedback(diff) {
        const activeCard = document.querySelector('.photo-card.active');
        if (!activeCard) return;

        const normalizedDiff = Math.max(-40, Math.min(40, diff * 0.2));
        const rotation = normalizedDiff * 0.05;

        activeCard.style.transform = `translateX(${-normalizedDiff}px) rotateY(${rotation}deg)`;
        activeCard.style.transition = 'none';
    }

    resetSwipeFeedback() {
        const activeCard = document.querySelector('.photo-card.active');
        if (activeCard) {
            activeCard.style.transform = '';
            activeCard.style.transition = '';
        }
    }

    handleKeyDown(e) {
        if (this.isAnimating) return;
        
        if (e.key === 'ArrowLeft') {
            this.previousCard();
        } else if (e.key === 'ArrowRight') {
            this.nextCard();
        }
    }

    nextCard() {
        if (this.isAnimating) return;
        
        if (this.currentIndex >= this.totalCards - 1) {
            this.bounceEffect();
            return;
        }
        
        this.currentIndex++;
        this.updateCardPositions();
        this.createSmoothTransition();
    }

    previousCard() {
        if (this.isAnimating) return;
        
        if (this.currentIndex <= 0) {
            this.bounceEffect();
            return;
        }
        
        this.currentIndex--;
        this.updateCardPositions();
        this.createSmoothTransition();
    }

    goToCard(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        
        this.currentIndex = index;
        this.updateCardPositions();
        this.createSmoothTransition();
    }

    bounceEffect() {
        const activeCard = document.querySelector('.photo-card.active');
        if (!activeCard) return;

        activeCard.style.animation = 'bounceScale 0.3s ease';
        setTimeout(() => {
            activeCard.style.animation = '';
        }, 300);
    }

    updateCardPositions() {
        const cards = document.querySelectorAll('.photo-card');
        const indicators = document.querySelectorAll('.indicator');
        
        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');
            
            if (index === this.currentIndex) {
                card.classList.add('active');
            } else if (index === this.currentIndex - 1) {
                card.classList.add('prev');
            } else if (index === this.currentIndex + 1) {
                card.classList.add('next');
            }
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
        
        this.updateButtonStates();
    }

    updateButtonStates() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentIndex === 0;
            prevBtn.style.opacity = this.currentIndex === 0 ? '0.4' : '1';
            prevBtn.style.pointerEvents = this.currentIndex === 0 ? 'none' : 'auto';
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentIndex === this.totalCards - 1;
            nextBtn.style.opacity = this.currentIndex === this.totalCards - 1 ? '0.4' : '1';
            nextBtn.style.pointerEvents = this.currentIndex === this.totalCards - 1 ? 'none' : 'auto';
        }
    }

    createSmoothTransition() {
        this.isAnimating = true;
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    handleResize() {
        // Handle resize events
        this.isMobile = this.detectMobile();
    }
}

// Smooth Mobile Passion Gallery
class SmoothMobilePassionGallery {
    constructor() {
        this.currentIndex = 0;
        this.totalCards = 6;
        this.isAnimating = false;
        this.isTouching = false;
        this.lastTouchTime = 0;
        this.isMobile = window.innerWidth <= 768;
        
        // Mobile-optimized settings
        this.minSwipeDistance = 25;
        this.maxSwipeTime = 500;
        this.minInterval = 300;
        this.animationDuration = 200;
        
        this.init();
    }

    init() {
        this.setupSmoothTouchEvents();
        this.setupButtonEvents();
        this.updatePassionCards();
        this.optimizeMobilePerformance();
    }

    setupSmoothTouchEvents() {
        const carousel = document.getElementById('passionCarousel');
        if (!carousel) return;

        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let currentX = 0;
        let isDragging = false;
        let velocityTracker = [];

        carousel.addEventListener('touchstart', (e) => {
            if (this.isAnimating) {
                e.preventDefault();
                return false;
            }

            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            currentX = startX;
            startTime = Date.now();
            isDragging = true;
            this.isTouching = true;
            velocityTracker = [];

            carousel.style.cursor = 'grabbing';
            e.preventDefault();
        }, { passive: false });

        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging || this.isAnimating) return;

            const touch = e.touches[0];
            currentX = touch.clientX;
            const currentY = touch.clientY;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault();
                
                const now = Date.now();
                velocityTracker.push({
                    time: now,
                    x: deltaX
                });
                
                velocityTracker = velocityTracker.filter(v => now - v.time < 100);
                this.updateSmoothFeedback(deltaX);
            }
        }, { passive: false });

        carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;

            isDragging = false;
            this.isTouching = false;
            carousel.style.cursor = 'grab';

            const endTime = Date.now();
            const totalDelta = currentX - startX;
            const totalTime = endTime - startTime;
            
            let velocity = 0;
            if (velocityTracker.length >= 2) {
                const recent = velocityTracker.slice(-2);
                const timeDiff = recent[1].time - recent[0].time;
                const positionDiff = recent[1].x - recent[0].x;
                velocity = timeDiff > 0 ? positionDiff / timeDiff : 0;
            }

            this.resetSmoothFeedback();

            const shouldSwipe = Math.abs(totalDelta) > this.minSwipeDistance || 
                               (Math.abs(velocity) > 0.3 && Math.abs(totalDelta) > 15);

            if (shouldSwipe && totalTime < this.maxSwipeTime) {
                const now = Date.now();
                if (now - this.lastTouchTime > this.minInterval) {
                    this.lastTouchTime = now;
                    
                    if (totalDelta < 0) {
                        this.smoothNextCard();
                    } else {
                        this.smoothPrevCard();
                    }
                }
            }

            velocityTracker = [];
            e.preventDefault();
        }, { passive: false });
    }

    updateSmoothFeedback(deltaX) {
        const activeCard = document.querySelector('.passion-card.active');
        if (!activeCard) return;

        const movement = Math.max(-15, Math.min(15, deltaX * 0.05));
        const rotation = movement * 0.05;
        const scale = 1 - Math.abs(movement) * 0.002;

        activeCard.style.transform = `translate3d(${movement}px, 0, 0) rotateY(${rotation}deg) scale(${scale})`;
        activeCard.style.transition = 'none';
        activeCard.style.willChange = 'transform';
    }

    resetSmoothFeedback() {
        const activeCard = document.querySelector('.passion-card.active');
        if (activeCard) {
            activeCard.style.transform = '';
            activeCard.style.transition = '';
            activeCard.style.willChange = 'auto';
        }
    }

    setupButtonEvents() {
        const prevBtn = document.getElementById('passionPrevBtn');
        const nextBtn = document.getElementById('passionNextBtn');

        if (prevBtn) {
            prevBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonTap(() => this.smoothPrevCard());
            }, { passive: false });
        }

        if (nextBtn) {
            nextBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonTap(() => this.smoothNextCard());
            }, { passive: false });
        }

        document.querySelectorAll('.passion-indicator').forEach((indicator, index) => {
            indicator.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonTap(() => this.smoothGoToCard(index));
            }, { passive: false });
        });
    }

    handleButtonTap(callback) {
        const now = Date.now();
        
        if (this.isAnimating || this.isTouching || (now - this.lastTouchTime < this.minInterval)) {
            return;
        }
        
        this.lastTouchTime = now;
        callback();
    }

    smoothNextCard() {
        if (this.isAnimating || this.currentIndex >= this.totalCards - 1) {
            this.bounceEffect();
            return;
        }
        
        this.currentIndex++;
        this.updatePassionCards();
        this.createUltraSmoothTransition();
    }

    smoothPrevCard() {
        if (this.isAnimating || this.currentIndex <= 0) {
            this.bounceEffect();
            return;
        }
        
        this.currentIndex--;
        this.updatePassionCards();
        this.createUltraSmoothTransition();
    }

    smoothGoToCard(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        
        this.currentIndex = index;
        this.updatePassionCards();
        this.createUltraSmoothTransition();
    }

    bounceEffect() {
        const activeCard = document.querySelector('.passion-card.active');
        if (!activeCard) return;

        activeCard.style.animation = 'mobileBounce 0.15s ease-out';
        setTimeout(() => {
            activeCard.style.animation = '';
        }, 150);

        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }

    updatePassionCards() {
        const cards = document.querySelectorAll('.passion-card');
        const indicators = document.querySelectorAll('.passion-indicator');
        
        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');
            card.style.willChange = 'transform';
            
            if (index === this.currentIndex) {
                card.classList.add('active');
            } else if (index === this.currentIndex - 1) {
                card.classList.add('prev');
            } else if (index === this.currentIndex + 1) {
                card.classList.add('next');
            }
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
        
        this.updateButtonStates();
    }

    updateButtonStates() {
        const prevBtn = document.getElementById('passionPrevBtn');
        const nextBtn = document.getElementById('passionNextBtn');
        
        if (prevBtn) {
            prevBtn.style.opacity = this.currentIndex === 0 ? '0.3' : '1';
            prevBtn.style.pointerEvents = this.currentIndex === 0 ? 'none' : 'auto';
        }
        
        if (nextBtn) {
            nextBtn.style.opacity = this.currentIndex === this.totalCards - 1 ? '0.3' : '1';
            nextBtn.style.pointerEvents = this.currentIndex === this.totalCards - 1 ? 'none' : 'auto';
        }
    }

    createUltraSmoothTransition() {
        this.isAnimating = true;
        
        const activeCard = document.querySelector('.passion-card.active');
        if (activeCard) {
            activeCard.style.willChange = 'transform';
        }
        
        setTimeout(() => {
            this.isAnimating = false;
            
            document.querySelectorAll('.passion-card').forEach(card => {
                card.style.willChange = 'auto';
            });
        }, this.animationDuration);
    }

    optimizeMobilePerformance() {
        if (!this.isMobile) return;

        const gallery = document.querySelector('.passion-4dx-gallery');
        if (gallery) {
            gallery.style.willChange = 'transform';
            gallery.style.webkitTransform = 'translateZ(0)';
            gallery.style.transform = 'translateZ(0)';
        }

        document.querySelectorAll('.passion-card').forEach(card => {
            card.style.webkitTransform = 'translateZ(0)';
            card.style.transform = 'translateZ(0)';
            card.style.webkitBackfaceVisibility = 'hidden';
            card.style.backfaceVisibility = 'hidden';
        });

        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.touchAction = 'pan-y';
    }

    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        this.optimizeMobilePerformance();
    }
}

// Global Functions
function startJourney() {
    if (window.romanticWebsite) {
        window.romanticWebsite.switchTab('passion', '#e91e63');
    }
}

function showLoveMessage() {
    const popup = document.createElement('div');
    popup.className = 'love-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <button class="close-btn" onclick="closeLoveMessage()">&times;</button>
            <h2>Meri Khoobsurat Zindagi — Tum</h2>
            <p>Tum wo aag ho jo meri har chaahat mein jalti hai,  
            wo roshni ho jo meri zindagi ko raasta dikhati ho,  
            aur wo pyaar ho jisme mera poora wajood ghul jaata hai...</p>

            <p>Har din tumhare saath ek nayi dua lagti hai,  
            har raat tumhari baahon mein ek jannat ka ehsaas hota hai.  
            Tumhara har ek baat, har ek muskaan mere ko ek naya duniya dikha deta hai ❤️</p>

            <p>Main sirf tumhara hoon — har soch, har sans, har jazbaat se.  
            Tum meri pehli subah bhi ho… aur meri aakhri khwahish bhi.</p>

            <div class="signature">Hamesha tumhara, sirf tumhara 💖</div>

        </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.querySelector('.popup-content').style.transform = 'scale(1)';
    }, 10);
}

function closeLoveMessage() {
    const popup = document.querySelector('.love-popup');
    if (popup) {
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.remove();
        }, 300);
    }
}

// Additional CSS Animations
const additionalStyles = `
@keyframes bounceScale {
    0% { transform: scale(1); }
    50% { transform: scale(1.03); }
    100% { transform: scale(1); }
}

@keyframes mobileBounce {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the website
document.addEventListener('DOMContentLoaded', () => {
    window.romanticWebsite = new RomanticWebsite();
});

// Fixed Passion Gallery - Corrected Implementation
class FixedPassionGallery {
    constructor() {
        this.currentIndex = 0;
        this.totalCards = 6;
        this.isAnimating = false;
        this.lastInteraction = 0;
        this.isMobile = window.innerWidth <= 768;
        this.minInterval = 350; // Prevent rapid interactions
        this.animationDuration = 400;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupPassion());
        } else {
            this.setupPassion();
        }
    }

    setupPassion() {
        // Check if passion section exists
        const passionSection = document.getElementById('passion');
        if (!passionSection) {
            console.log('Passion section not found');
            return;
        }

        this.setupPassionEventListeners();
        this.updatePassionCards();
        this.optimizeForMobile();
        this.isInitialized = true;
        console.log('Passion gallery initialized successfully');
    }

    setupPassionEventListeners() {
        // Previous button
        const prevBtn = document.getElementById('passionPrevBtn');
        if (prevBtn) {
            // Remove any existing listeners
            prevBtn.replaceWith(prevBtn.cloneNode(true));
            const newPrevBtn = document.getElementById('passionPrevBtn');
            
            newPrevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handlePassionNavigation('prev');
            });
            
            if (this.isMobile) {
                newPrevBtn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handlePassionNavigation('prev');
                }, { passive: false });
            }
        }

        // Next button
        const nextBtn = document.getElementById('passionNextBtn');
        if (nextBtn) {
            // Remove any existing listeners
            nextBtn.replaceWith(nextBtn.cloneNode(true));
            const newNextBtn = document.getElementById('passionNextBtn');
            
            newNextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handlePassionNavigation('next');
            });
            
            if (this.isMobile) {
                newNextBtn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handlePassionNavigation('next');
                }, { passive: false });
            }
        }

        // Indicators
        document.querySelectorAll('.passion-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handlePassionNavigation('goto', index);
            });
            
            if (this.isMobile) {
                indicator.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handlePassionNavigation('goto', index);
                }, { passive: false });
            }
        });

        // Swipe handling
        const passionCarousel = document.getElementById('passionCarousel');
        if (passionCarousel) {
            this.setupPassionSwipe(passionCarousel);
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('passion').classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    this.handlePassionNavigation('prev');
                } else if (e.key === 'ArrowRight') {
                    this.handlePassionNavigation('next');
                }
            }
        });
    }

    handlePassionNavigation(direction, index = null) {
        const now = Date.now();
        
        // Prevent rapid interactions
        if (now - this.lastInteraction < this.minInterval) {
            return;
        }
        
        if (this.isAnimating) {
            return;
        }
        
        this.lastInteraction = now;
        
        switch (direction) {
            case 'prev':
                if (this.currentIndex > 0) {
                    this.currentIndex--;
                    this.updatePassionCards();
                    this.animatePassionTransition();
                } else {
                    this.bounceEffect();
                }
                break;
            case 'next':
                if (this.currentIndex < this.totalCards - 1) {
                    this.currentIndex++;
                    this.updatePassionCards();
                    this.animatePassionTransition();
                } else {
                    this.bounceEffect();
                }
                break;
            case 'goto':
                if (index !== null && index !== this.currentIndex && index >= 0 && index < this.totalCards) {
                    this.currentIndex = index;
                    this.updatePassionCards();
                    this.animatePassionTransition();
                }
                break;
        }
    }

    setupPassionSwipe(carousel) {
        let startX = 0;
        let startTime = 0;
        let isDragging = false;

        carousel.addEventListener('touchstart', (e) => {
            if (this.isAnimating) {
                e.preventDefault();
                return;
            }
            
            startX = e.touches[0].clientX;
            startTime = Date.now();
            isDragging = true;
        }, { passive: false });

        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging || this.isAnimating) return;
            
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            if (Math.abs(diff) > 15) {
                e.preventDefault();
                this.updatePassionFeedback(diff);
            }
        }, { passive: false });

        carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            const endX = e.changedTouches[0].clientX;
            const endTime = Date.now();
            const diff = startX - endX;
            const duration = endTime - startTime;
            
            this.resetPassionFeedback();
            
            // Swipe detection
            if (Math.abs(diff) > 50 || (Math.abs(diff) > 25 && duration < 300)) {
                if (diff > 0) {
                    this.handlePassionNavigation('next');
                } else {
                    this.handlePassionNavigation('prev');
                }
            }
        }, { passive: true });
    }

    updatePassionFeedback(diff) {
        const activeCard = document.querySelector('.passion-card.active');
        if (!activeCard) return;

        const movement = Math.max(-25, Math.min(25, diff * 0.1));
        const rotation = movement * 0.1;
        
        activeCard.style.transform = `translate3d(${-movement}px, 0, 0) rotateY(${rotation}deg)`;
        activeCard.style.transition = 'none';
    }

    resetPassionFeedback() {
        const activeCard = document.querySelector('.passion-card.active');
        if (activeCard) {
            activeCard.style.transform = '';
            activeCard.style.transition = '';
        }
    }

    bounceEffect() {
        const activeCard = document.querySelector('.passion-card.active');
        if (!activeCard) return;

        activeCard.style.animation = 'passionBounce 0.3s ease';
        setTimeout(() => {
            activeCard.style.animation = '';
        }, 300);

        // Haptic feedback on mobile
        if (navigator.vibrate && this.isMobile) {
            navigator.vibrate(50);
        }
    }

    updatePassionCards() {
        const cards = document.querySelectorAll('.passion-card');
        const indicators = document.querySelectorAll('.passion-indicator');
        
        if (cards.length === 0) {
            console.log('No passion cards found');
            return;
        }
        
        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');
            
            if (index === this.currentIndex) {
                card.classList.add('active');
            } else if (index === this.currentIndex - 1) {
                card.classList.add('prev');
            } else if (index === this.currentIndex + 1) {
                card.classList.add('next');
            }
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
        
        this.updatePassionButtons();
    }

    updatePassionButtons() {
        const prevBtn = document.getElementById('passionPrevBtn');
        const nextBtn = document.getElementById('passionNextBtn');
        
        if (prevBtn) {
            prevBtn.style.opacity = this.currentIndex === 0 ? '0.4' : '1';
            prevBtn.style.pointerEvents = this.currentIndex === 0 ? 'none' : 'auto';
            prevBtn.disabled = this.currentIndex === 0;
        }
        
        if (nextBtn) {
            nextBtn.style.opacity = this.currentIndex === this.totalCards - 1 ? '0.4' : '1';
            nextBtn.style.pointerEvents = this.currentIndex === this.totalCards - 1 ? 'none' : 'auto';
            nextBtn.disabled = this.currentIndex === this.totalCards - 1;
        }
    }

    animatePassionTransition() {
        this.isAnimating = true;
        
        setTimeout(() => {
            this.isAnimating = false;
        }, this.animationDuration);
    }

    optimizeForMobile() {
        if (this.isMobile) {
            const passionGallery = document.querySelector('.passion-4dx-gallery');
            if (passionGallery) {
                passionGallery.style.webkitTransform = 'translateZ(0)';
                passionGallery.style.transform = 'translateZ(0)';
            }
            
            // Optimize all cards for mobile
            document.querySelectorAll('.passion-card').forEach(card => {
                card.style.webkitTransform = 'translateZ(0)';
                card.style.transform = 'translateZ(0)';
                card.style.webkitBackfaceVisibility = 'hidden';
                card.style.backfaceVisibility = 'hidden';
            });
        }
    }

    // Public method to check if initialized
    isReady() {
        return this.isInitialized;
    }

    // Public method to reset gallery
    reset() {
        this.currentIndex = 0;
        this.updatePassionCards();
    }
}

// Enhanced initialization with better error handling
function initializePassionGallery() {
    // Clear any existing gallery
    if (window.passionGallery) {
        window.passionGallery = null;
    }
    
    // Check if passion section is active
    const passionSection = document.getElementById('passion');
    if (!passionSection) {
        console.log('Passion section not found');
        return;
    }
    
    if (!passionSection.classList.contains('active')) {
        console.log('Passion section not active, skipping initialization');
        return;
    }
    
    // Initialize new gallery
    try {
        window.passionGallery = new FixedPassionGallery();
        console.log('Passion gallery created successfully');
    } catch (error) {
        console.error('Error creating passion gallery:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializePassionGallery();
});

// Initialize when passion tab is clicked
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-tab="passion"]') || e.target.closest('[data-tab="passion"]')) {
        setTimeout(() => {
            initializePassionGallery();
        }, 200);
    }
});

// Simple Slide-Based Passion Gallery
class SlidePassionGallery {
    constructor() {
        this.currentIndex = 0;
        this.totalCards = 6;
        this.isAnimating = false;
        this.cardWidth = 360; // Card width + margin
        this.container = null;
        this.cards = [];
        this.init();
    }

    init() {
        this.container = document.getElementById('passionCardsContainer');
        this.cards = document.querySelectorAll('.passion-card');
        
        if (!this.container || this.cards.length === 0) {
            console.log('Passion elements not found');
            return;
        }

        this.setupEventListeners();
        this.updateDisplay();
        this.setupMobileOptimization();
        console.log('Slide passion gallery initialized');
    }

    setupEventListeners() {
        // Previous button
        const prevBtn = document.getElementById('passionPrevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.goToPrevious());
            prevBtn.addEventListener('touchstart', () => this.goToPrevious(), { passive: true });
        }

        // Next button
        const nextBtn = document.getElementById('passionNextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.goToNext());
            nextBtn.addEventListener('touchstart', () => this.goToNext(), { passive: true });
        }

        // Indicators
        document.querySelectorAll('.passion-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
            indicator.addEventListener('touchstart', () => this.goToSlide(index), { passive: true });
        });

        // Touch swipe
        this.setupTouchSwipe();

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('passion').classList.contains('active')) {
                if (e.key === 'ArrowLeft') this.goToPrevious();
                if (e.key === 'ArrowRight') this.goToNext();
            }
        });
    }

    setupTouchSwipe() {
        let startX = 0;
        let startY = 0;
        let isDragging = false;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });

        this.container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;

            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        this.container.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.goToNext();
                } else {
                    this.goToPrevious();
                }
            }
        }, { passive: true });
    }

    goToPrevious() {
        if (this.isAnimating || this.currentIndex <= 0) {
            this.bounceEffect();
            return;
        }
        this.currentIndex--;
        this.updateDisplay();
    }

    goToNext() {
        if (this.isAnimating || this.currentIndex >= this.totalCards - 1) {
            this.bounceEffect();
            return;
        }
        this.currentIndex++;
        this.updateDisplay();
    }

    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        this.currentIndex = index;
        this.updateDisplay();
    }

    updateDisplay() {
        this.isAnimating = true;

        // Update container position
        const offset = -this.currentIndex * this.cardWidth;
        this.container.style.transform = `translateX(${offset}px)`;

        // Update card states
        this.cards.forEach((card, index) => {
            card.classList.remove('center', 'left', 'right');
            
            if (index === this.currentIndex) {
                card.classList.add('center');
            } else if (index < this.currentIndex) {
                card.classList.add('left');
            } else {
                card.classList.add('right');
            }
        });

        // Update indicators
        document.querySelectorAll('.passion-indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });

        // Update buttons
        this.updateButtons();

        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
        }, 400);
    }

    updateButtons() {
        const prevBtn = document.getElementById('passionPrevBtn');
        const nextBtn = document.getElementById('passionNextBtn');

        if (prevBtn) {
            prevBtn.disabled = this.currentIndex === 0;
            prevBtn.style.opacity = this.currentIndex === 0 ? '0.3' : '1';
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentIndex === this.totalCards - 1;
            nextBtn.style.opacity = this.currentIndex === this.totalCards - 1 ? '0.3' : '1';
        }
    }

    bounceEffect() {
        const centerCard = document.querySelector('.passion-card.center');
        if (centerCard) {
            centerCard.style.animation = 'cardBounce 0.3s ease';
            setTimeout(() => {
                centerCard.style.animation = '';
            }, 300);
        }

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    setupMobileOptimization() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            this.cardWidth = 280; // Smaller for mobile
            this.updateDisplay();
        }
    }
}

// Add bounce animation
const bounceCSS = `
@keyframes cardBounce {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}
`;

const styleElement = document.createElement('style');
styleElement.textContent = bounceCSS;
document.head.appendChild(styleElement);

// Initialize the new gallery
function initSlidePassionGallery() {
    const passionSection = document.getElementById('passion');
    if (passionSection && passionSection.classList.contains('active')) {
        if (window.slidePassionGallery) {
            window.slidePassionGallery = null;
        }
        window.slidePassionGallery = new SlidePassionGallery();
    }
}

// Initialize on page load and tab switch
document.addEventListener('DOMContentLoaded', initSlidePassionGallery);

document.addEventListener('click', (e) => {
    if (e.target.matches('[data-tab="passion"]') || e.target.closest('[data-tab="passion"]')) {
        setTimeout(initSlidePassionGallery, 200);
    }
});
// Fixed Slide Passion Gallery - Smooth Scrolling
class OptimizedPassionGallery {
    constructor() {
        this.currentIndex = 0;
        this.totalCards = 6;
        this.isAnimating = false;
        this.isTouching = false;
        this.cardWidth = 350; // Card width + margin
        this.container = null;
        this.cards = [];
        this.startX = 0;
        this.startY = 0;
        this.threshold = 50;
        this.init();
    }

    init() {
        this.container = document.getElementById('passionCardsContainer');
        this.cards = document.querySelectorAll('.passion-card');
        
        if (!this.container || this.cards.length === 0) {
            console.log('Passion elements not found');
            return;
        }

        this.setupEventListeners();
        this.updateDisplay();
        this.optimizeForMobile();
        this.centerContainer();
        console.log('Optimized passion gallery initialized');
    }

    centerContainer() {
        // Center the first card
        const offset = (this.container.parentElement.offsetWidth - this.cardWidth) / 2;
        this.container.style.paddingLeft = offset + 'px';
        this.updateDisplay();
    }

    setupEventListeners() {
        // Previous button
        const prevBtn = document.getElementById('passionPrevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPrevious();
            });
        }

        // Next button
        const nextBtn = document.getElementById('passionNextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToNext();
            });
        }

        // Indicators
        document.querySelectorAll('.passion-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(index);
            });
        });

        // Enhanced touch handling for mobile
        this.setupMobileTouchEvents();

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('passion').classList.contains('active')) {
                if (e.key === 'ArrowLeft') this.goToPrevious();
                if (e.key === 'ArrowRight') this.goToNext();
            }
        });

        // Handle resize
        window.addEventListener('resize', () => {
            this.optimizeForMobile();
            this.centerContainer();
        });
    }

    setupMobileTouchEvents() {
        const gallery = this.container.parentElement;
        
        // Improved touch handling to prevent scroll conflicts
        gallery.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            this.isTouching = true;
        }, { passive: true });

        gallery.addEventListener('touchmove', (e) => {
            if (!this.isTouching) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = Math.abs(this.startX - currentX);
            const diffY = Math.abs(this.startY - currentY);

            // Only prevent default for horizontal swipes (card navigation)
            // Allow vertical scrolling (page scroll)
            if (diffX > diffY && diffX > 10) {
                e.preventDefault(); // Prevent page scroll for horizontal swipes
            }
        }, { passive: false });

        gallery.addEventListener('touchend', (e) => {
            if (!this.isTouching) return;
            this.isTouching = false;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = this.startX - endX;
            const diffY = this.startY - endY;

            // Only handle horizontal swipes for card navigation
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.threshold) {
                e.preventDefault();
                if (diffX > 0) {
                    this.goToNext();
                } else {
                    this.goToPrevious();
                }
            }
            // Vertical swipes are allowed to pass through for page scrolling
        }, { passive: false });
    }

    goToPrevious() {
        if (this.isAnimating || this.currentIndex <= 0) {
            this.bounceEffect();
            return;
        }
        this.currentIndex--;
        this.updateDisplay();
    }

    goToNext() {
        if (this.isAnimating || this.currentIndex >= this.totalCards - 1) {
            this.bounceEffect();
            return;
        }
        this.currentIndex++;
        this.updateDisplay();
    }

    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        this.currentIndex = index;
        this.updateDisplay();
    }

    updateDisplay() {
        this.isAnimating = true;

        // Calculate proper offset for centering
        const offset = -this.currentIndex * this.cardWidth;
        this.container.style.transform = `translateX(${offset}px)`;

        // Update card states with smooth transitions and improved 3D effect
        this.cards.forEach((card, index) => {
            card.classList.remove('center', 'left', 'right');
            card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';

            if (index === this.currentIndex) {
                card.classList.add('center');
                card.style.opacity = '1';
                card.style.transform = 'scale(1) translateZ(0) rotateY(0deg)';
                card.style.zIndex = '10';
            } else if (index < this.currentIndex) {
                card.classList.add('left');
                card.style.opacity = '0.75';
                card.style.transform = 'scale(0.9) translateX(-110px) rotateY(-20deg)';
                card.style.zIndex = '5';
            } else {
                card.classList.add('right');
                card.style.opacity = '0.75';
                card.style.transform = 'scale(0.9) translateX(110px) rotateY(20deg)';
                card.style.zIndex = '5';
            }
        });

        // Update indicators
        document.querySelectorAll('.passion-indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });

        // Update buttons
        this.updateButtons();

        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
        }, 400);
    }

    updateButtons() {
        const prevBtn = document.getElementById('passionPrevBtn');
        const nextBtn = document.getElementById('passionNextBtn');

        if (prevBtn) {
            prevBtn.disabled = this.currentIndex === 0;
            prevBtn.style.opacity = this.currentIndex === 0 ? '0.3' : '1';
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentIndex === this.totalCards - 1;
            nextBtn.style.opacity = this.currentIndex === this.totalCards - 1 ? '0.3' : '1';
        }
    }

    bounceEffect() {
        const centerCard = document.querySelector('.passion-card.center');
        if (centerCard) {
            centerCard.style.animation = 'cardBounce 0.25s ease';
            setTimeout(() => {
                centerCard.style.animation = '';
            }, 250);
        }

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }

    optimizeForMobile() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            this.cardWidth = 300; // Smaller spacing for mobile
            this.threshold = 30; // Lower swipe threshold
        } else {
            this.cardWidth = 350;
            this.threshold = 50;
        }
    }
}

// Enhanced bounce animation
const enhancedBounceCSS = `
@keyframes cardBounce {
    0% { transform: scale(1); }
    50% { transform: scale(1.03); }
    100% { transform: scale(1); }
}

/* Smooth scroll optimization */
.passion-4dx-container {
    -webkit-overflow-scrolling: touch;
    overflow-x: hidden;
}

/* Prevent touch conflicts */
.passion-card {
    touch-action: none; /* Prevent default touch behaviors on cards */
}

.passion-4dx-gallery {
    touch-action: pan-y; /* Allow vertical scrolling but prevent horizontal */
}
`;

// Add enhanced styles
const enhancedStyleElement = document.createElement('style');
enhancedStyleElement.textContent = enhancedBounceCSS;
document.head.appendChild(enhancedStyleElement);

function initOptimizedPassionGallery() {
    const passionSection = document.getElementById('passion');
    if (passionSection && passionSection.classList.contains('active')) {
        if (window.optimizedPassionGallery) {
            window.optimizedPassionGallery = null;
        }
        setTimeout(() => {
            window.optimizedPassionGallery = new OptimizedPassionGallery();
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', initOptimizedPassionGallery);

document.addEventListener('click', (e) => {
    if (e.target.matches('[data-tab="passion"]') || e.target.closest('[data-tab="passion"]')) {
        setTimeout(initOptimizedPassionGallery, 250);
    }
});
