// ============ قلب‌های شناور ============
function createFloatingHeart() {
    const container = document.getElementById('heartsContainer');
    const heart = document.createElement('span');
    heart.classList.add('floating-heart');

    const emojis = ['❤️', '💕', '💖', '💗', '💝', '💘', '🌸', '✨', '💎', '🦋', '🌹', '💫', '🕊️', '💜'];
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 35 + 15) + 'px';
    heart.style.animationDuration = (Math.random() * 6 + 5) + 's';
    heart.style.animationDelay = Math.random() * 3 + 's';

    container.appendChild(heart);

    setTimeout(function() {
        heart.remove();
    }, 9000);
}

setInterval(createFloatingHeart, 350);

for (let i = 0; i < 10; i++) {
    setTimeout(createFloatingHeart, i * 250);
}

// ============ ذرات دنباله‌رو موس ============
document.addEventListener('mousemove', function(e) {
    if (Math.random() > 0.8) {
        const particle = document.createElement('span');
        particle.classList.add('mouse-particle');
        
        const stars = ['✨', '💫', '⭐', '🌟'];
        particle.textContent = stars[Math.floor(Math.random() * stars.length)];
        
        particle.style.left = e.clientX + 'px';
        particle.style.top = e.clientY + 'px';
        particle.style.fontSize = (Math.random() * 12 + 6) + 'px';
        particle.style.setProperty('--dx', (Math.random() * 50 - 25) + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(function() {
            particle.remove();
        }, 1000);
    }
});

// ============ تایپ افکت ============
const messages = [
    "تو نوری تو قلب منی...",
    "هر لحظه با تو قشنگه...",
    "مائده یعنی عشق واقعی...",
    "دوست دارم بیشتر از هرچیزی...",
    "نگین قلبمی تو... 💎"
];

let messageIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedText = document.getElementById('typedText');

function typeEffect() {
    const currentMessage = messages[messageIndex];

    if (isDeleting) {
        typedText.textContent = currentMessage.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typedText.textContent = currentMessage.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 45 : 90;

    if (!isDeleting && charIndex === currentMessage.length) {
        speed = 2200;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        messageIndex = (messageIndex + 1) % messages.length;
        speed = 400;
    }

    setTimeout(typeEffect, speed);
}

typeEffect();

// ============ کلیک روی قلب ============
const bigHeartWrapper = document.getElementById('bigHeartWrapper');
const hiddenMessage = document.getElementById('hiddenMessage');
let isMessageShown = false;

bigHeartWrapper.addEventListener('click', function(event) {
    if (!isMessageShown) {
        hiddenMessage.classList.add('show');
        isMessageShown = true;
        createConfetti(80);
    }

    createConfetti(30);
    createClickHeart(event.clientX, event.clientY);

    // پالس قلب
    const heart = bigHeartWrapper.querySelector('.big-heart');
    heart.style.transform = 'scale(1.6)';
    heart.style.filter = 'drop-shadow(0 0 80px rgba(255, 0, 100, 1))';
    setTimeout(function() {
        heart.style.transform = '';
        heart.style.filter = '';
    }, 300);
});

function createClickHeart(x, y) {
    const heart = document.createElement('span');
    heart.classList.add('click-heart');
    heart.textContent = '💖';
    heart.style.left = (x - 22) + 'px';
    heart.style.top = (y - 22) + 'px';
    document.body.appendChild(heart);
    setTimeout(function() {
        heart.remove();
    }, 1200);
}

// ============ کانفتی ============
function createConfetti(count) {
    if (!count) count = 50;

    const colors = [
        '#ff3366', '#ff6699', '#ff99cc', '#ffccdd', '#ff6666',
        '#ff0033', '#ff9999', '#ffffff', '#ffd700', '#ff6347',
        '#ff1493', '#ff69b4', '#ffc0cb', '#ff4444', '#ffaaaa'
    ];

    for (let i = 0; i < count; i++) {
        setTimeout(function() {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti-piece');

            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = -(Math.random() * 20 + 10) + 'px';
            confetti.style.width = (Math.random() * 12 + 6) + 'px';
            confetti.style.height = (Math.random() * 12 + 6) + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2.5) + 's';
            confetti.style.animationDelay = Math.random() * 0.8 + 's';

            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            } else if (Math.random() > 0.7) {
                confetti.style.width = (Math.random() * 6 + 3) + 'px';
                confetti.style.height = (Math.random() * 20 + 10) + 'px';
                confetti.style.borderRadius = '2px';
            }

            document.body.appendChild(confetti);

            setTimeout(function() {
                confetti.remove();
            }, 4000);
        }, i * 20);
    }
}

// ============ گالری و مودال ============
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const modalClose = document.getElementById('modalClose');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');

let currentImageIndex = 0;
let galleryArray = [];

function updateGalleryArray() {
    galleryArray = Array.from(document.querySelectorAll('.gallery-item'));
}
updateGalleryArray();

// کلیک روی عکس
document.addEventListener('click', function(e) {
    const galleryItem = e.target.closest('.gallery-item');
    if (galleryItem) {
        updateGalleryArray();
        currentImageIndex = galleryArray.indexOf(galleryItem);
        openModal(currentImageIndex);
    }
});

function openModal(index) {
    if (galleryArray.length === 0) return;

    const item = galleryArray[index];
    const img = item.querySelector('img');
    const caption = item.getAttribute('data-caption');

    modalImage.src = img.src;
    modalImage.alt = img.alt;
    modalCaption.textContent = caption || '';
    modal.classList.add('active');

    if (galleryArray.length > 1) {
        modalPrev.style.display = 'block';
        modalNext.style.display = 'block';
    } else {
        modalPrev.style.display = 'none';
        modalNext.style.display = 'none';
    }

    createConfetti(20);
}

function closeModal() {
    modal.classList.remove('active');
}

function nextImage() {
    updateGalleryArray();
    if (galleryArray.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % galleryArray.length;
    openModal(currentImageIndex);
}

function prevImage() {
    updateGalleryArray();
    if (galleryArray.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + galleryArray.length) % galleryArray.length;
    openModal(currentImageIndex);
}

modalClose.addEventListener('click', closeModal);
modalNext.addEventListener('click', nextImage);
modalPrev.addEventListener('click', prevImage);

modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
});

// لمس برای موبایل
let touchStartX = 0;
modal.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
});
modal.addEventListener('touchend', function(e) {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            nextImage();
        } else {
            prevImage();
        }
    }
});

// کیبورد
document.addEventListener('keydown', function(e) {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextImage();
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevImage();
});

// ============ اسکرول به گالری ============
document.getElementById('scrollToGallery').addEventListener('click', function() {
    document.getElementById('gallerySection').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function() {
        createConfetti(40);
    }, 500);
});

// ============ موزیک ============
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
let isMusicPlaying = false;

bgMusic.volume = 0.5;

musicBtn.addEventListener('click', function() {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicBtn.textContent = '🎵';
        musicBtn.classList.remove('playing');
        musicBtn.title = 'پخش موسیقی';
    } else {
        bgMusic.play().then(function() {
            console.log('🎵 نگین قلبمی - مجید رضوی');
        }).catch(function() {
            alert('برای پخش موزیک یه بار دیگه کلیک کن ❤️');
        });
        musicBtn.textContent = '🔊';
        musicBtn.classList.add('playing');
        musicBtn.title = 'توقف موسیقی';
    }
    isMusicPlaying = !isMusicPlaying;
});

// ============ کیبورد ============
document.addEventListener('keydown', function(e) {
    if ((e.key === 'm' || e.key === 'م') && !modal.classList.contains('active')) {
        hiddenMessage.classList.toggle('show');
        if (hiddenMessage.classList.contains('show')) {
            createConfetti(40);
            isMessageShown = true;
        }
    }
});

// ============ کنسول ============
console.log('%c❤️ سلام مائده جان! ❤️', 'font-size:24px;color:#ff3366;');
console.log('%cاین سایت با عشق برای تو ساخته شده 💕', 'font-size:16px;color:#ff9999;');
console.log('%cنگین قلبمی 💎', 'font-size:18px;color:#ff6688;');
console.log('%c🎵 مجید رضوی - نگین قلبمی', 'font-size:14px;color:#ffaaaa;');
