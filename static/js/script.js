// ================================
// MOOG COMIC BINDER - JavaScript
// ================================

document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializeAnimations();
    initializeEmailForm();
    initializeFloatingReminder();
    initializeComicFlip();
    console.log('MOOG Comic Binder loaded successfully!');
});

// ================================
// COMIC BOOK 3D ROTATION
// ================================

function initializeComicFlip() {
    const comicBook = document.querySelector('.comic-book');
    const comicContainer = document.querySelector('.comic-book-container');
    const comicInner = document.querySelector('.comic-book-inner');
    
    if (!comicBook || !comicContainer || !comicInner) {
        console.log('Comic book elements not found');
        return;
    }
    
    // Add interactive class for performance optimization
    comicBook.classList.add('interactive');
    
    // Rotation sensitivity settings (adjustable)
    const rotationSettings = {
        maxRotationX: 25,    // Maximum X-axis rotation in degrees
        maxRotationY: 180,   // Maximum Y-axis rotation in degrees (full flip)
        sensitivity: 0.8,    // Sensitivity multiplier (lower = less sensitive)
        smoothing: 0.1,      // Smoothing factor for transitions
        resetSpeed: 0.05     // Speed of return to center when not interacting
    };
    
    let isInteracting = false;
    let currentRotationX = 0;
    let currentRotationY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let animationId = null;
    
    // Get container bounds for calculation
    function getContainerBounds() {
        return comicContainer.getBoundingClientRect();
    }
    
    // Calculate rotation based on pointer position
    function calculateRotation(clientX, clientY) {
        const bounds = getContainerBounds();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        
        // Calculate normalized coordinates (-1 to 1)
        const normalizedX = ((clientX - centerX) / (bounds.width / 2)) * rotationSettings.sensitivity;
        const normalizedY = ((clientY - centerY) / (bounds.height / 2)) * rotationSettings.sensitivity;
        
        // Calculate rotation angles
        const rotationY = Math.max(-rotationSettings.maxRotationY, 
                         Math.min(rotationSettings.maxRotationY, normalizedX * rotationSettings.maxRotationY));
        const rotationX = Math.max(-rotationSettings.maxRotationX, 
                         Math.min(rotationSettings.maxRotationX, -normalizedY * rotationSettings.maxRotationX));
        
        return { x: rotationX, y: rotationY };
    }
    
    // Apply 3D transform with dynamic shadows
    function applyTransform() {
        // Smooth interpolation to target rotation
        currentRotationX += (targetRotationX - currentRotationX) * rotationSettings.smoothing;
        currentRotationY += (targetRotationY - currentRotationY) * rotationSettings.smoothing;
        
        // Apply transform to the inner container
        comicInner.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
        
        // Dynamic shadow and visual effects based on rotation
        updateVisualEffects();
        
        // Continue animation if still needed
        if (Math.abs(targetRotationX - currentRotationX) > 0.1 || 
            Math.abs(targetRotationY - currentRotationY) > 0.1) {
            animationId = requestAnimationFrame(applyTransform);
        } else {
            animationId = null;
        }
    }
    
    // Update visual effects based on rotation
    function updateVisualEffects() {
        const absRotationY = Math.abs(currentRotationY);
        const isShowingBack = absRotationY > 90;
        
        // Update classes for styling
        comicBook.classList.toggle('showing-back', isShowingBack);
        comicBook.classList.toggle('rotating-y-pos', currentRotationY > 15);
        comicBook.classList.toggle('rotating-y-neg', currentRotationY < -15);
        
        // Dynamic shadow calculation
        const shadowIntensity = Math.abs(currentRotationX) / rotationSettings.maxRotationX;
        const shadowOffsetX = currentRotationY * 0.3;
        const shadowOffsetY = Math.abs(currentRotationX) * 0.5 + 10;
        const shadowBlur = Math.abs(currentRotationX) + Math.abs(currentRotationY * 0.3) + 15;
        
        // Apply dynamic shadows
        const frontElement = document.querySelector('.comic-front');
        const backElement = document.querySelector('.comic-back');
        
        if (frontElement && backElement) {
            const baseShadow = `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px rgba(0,0,0,${0.4 + shadowIntensity * 0.3})`;
            
            if (isShowingBack) {
                backElement.style.boxShadow = `${baseShadow}, 0 2px 8px rgba(0,0,0,0.4)`;
                frontElement.style.boxShadow = `0 5px 15px rgba(0,0,0,0.3)`;
            } else {
                frontElement.style.boxShadow = `${baseShadow}, 0 0 50px var(--shadow-color), 0 5px 15px rgba(220, 53, 69, 0.3)`;
                backElement.style.boxShadow = `0 10px 30px rgba(0,0,0,0.4)`;
            }
        }
    }
    
    // Start or continue smooth animation
    function startAnimation() {
        if (!animationId) {
            animationId = requestAnimationFrame(applyTransform);
        }
    }
    
    // Reset to center position
    function resetRotation() {
        isInteracting = false;
        targetRotationX = 0;
        targetRotationY = 0;
        startAnimation();
    }
    
    // Mouse Events
    comicContainer.addEventListener('mouseenter', () => {
        isInteracting = true;
    });
    
    comicContainer.addEventListener('mousemove', (e) => {
        if (!isInteracting) return;
        
        const rotation = calculateRotation(e.clientX, e.clientY);
        targetRotationX = rotation.x;
        targetRotationY = rotation.y;
        startAnimation();
    });
    
    comicContainer.addEventListener('mouseleave', () => {
        resetRotation();
    });
    
    // Touch Events for Mobile
    comicContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isInteracting = true;
            const touch = e.touches[0];
            const rotation = calculateRotation(touch.clientX, touch.clientY);
            targetRotationX = rotation.x;
            targetRotationY = rotation.y;
            startAnimation();
        }
    });
    
    comicContainer.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isInteracting) {
            e.preventDefault();
            const touch = e.touches[0];
            const rotation = calculateRotation(touch.clientX, touch.clientY);
            targetRotationX = rotation.x;
            targetRotationY = rotation.y;
            startAnimation();
        }
    });
    
    comicContainer.addEventListener('touchend', () => {
        resetRotation();
    });
    
    // Prevent context menu
    comicContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Make focusable for accessibility
    comicBook.setAttribute('tabindex', '0');
    comicBook.setAttribute('role', 'img');
    comicBook.setAttribute('aria-label', 'Interactive 3D comic book - move mouse or touch to rotate');
    
    // Keyboard support for accessibility
    comicBook.addEventListener('keydown', (e) => {
        const step = 15;
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                targetRotationY = Math.max(-rotationSettings.maxRotationY, targetRotationY - step);
                startAnimation();
                break;
            case 'ArrowRight':
                e.preventDefault();
                targetRotationY = Math.min(rotationSettings.maxRotationY, targetRotationY + step);
                startAnimation();
                break;
            case 'ArrowUp':
                e.preventDefault();
                targetRotationX = Math.max(-rotationSettings.maxRotationX, targetRotationX - step);
                startAnimation();
                break;
            case 'ArrowDown':
                e.preventDefault();
                targetRotationX = Math.min(rotationSettings.maxRotationX, targetRotationX + step);
                startAnimation();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                resetRotation();
                break;
        }
    });
    
    console.log('3D comic book rotation initialized with settings:', rotationSettings);
}

// ================================
// COUNTDOWN TIMER
// ================================

function initializeCountdown() {
    const targetDate = new Date('August 24, 2025 00:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            // Countdown has ended
            document.getElementById('countdown').innerHTML = `
                <div class="countdown-ended">
                    <h3 class="text-danger">Launch Time!</h3>
                    <p>The wait is over - get your copy now!</p>
                </div>
            `;
            return;
        }
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update display with animation
        updateCountdownElement('days', days.toString().padStart(3, '0'));
        updateCountdownElement('hours', hours.toString().padStart(2, '0'));
        updateCountdownElement('minutes', minutes.toString().padStart(2, '0'));
        updateCountdownElement('seconds', seconds.toString().padStart(2, '0'));
    }
    
    function updateCountdownElement(id, value) {
        const element = document.getElementById(id);
        if (element && element.textContent !== value) {
            element.style.transform = 'scale(1.2)';
            element.textContent = value;
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    // Update countdown immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ================================
// EMAIL CAPTURE
// ================================

function initializeEmailForm() {
    const form = document.getElementById('emailForm');
    const input = document.getElementById('gmailInput');
    
    // Real-time validation
    input.addEventListener('input', function() {
        validateEmail(this.value);
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        captureEmail();
    });
}

function validateEmail(email) {
    const input = document.getElementById('gmailInput');
    const isValid = email === '' || /^[^\s@]+@gmail\.com$/i.test(email);
    
    input.classList.remove('is-valid', 'is-invalid');
    
    if (email !== '') {
        if (isValid) {
            input.classList.add('is-valid');
        } else {
            input.classList.add('is-invalid');
        }
    }
    
    return isValid;
}

function captureEmail() {
    const emailInput = document.getElementById('gmailInput');
    const email = emailInput.value.trim();
    
    // If no email entered, just proceed
    if (!email) {
        console.log('No email entered, proceeding to checkout');
        return;
    }
    
    // Validate email
    if (!validateEmail(email)) {
        showToast('Please enter a valid Gmail address', 'error');
        return;
    }
    
    // Show loading state
    const button = document.querySelector('.comic-notify-btn');
    if (!button) return;
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Saving...</span>';
    button.disabled = true;
    
    // Send email to backend
    fetch('/capture_lead', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `gmail=${encodeURIComponent(email)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Email captured successfully! Thanks for joining our community.', 'success');
            emailInput.value = '';
            emailInput.classList.remove('is-valid', 'is-invalid');
        } else {
            showToast('Error capturing email. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Network error. Please check your connection.', 'error');
    })
    .finally(() => {
        // Restore button
        button.innerHTML = originalContent;
        button.disabled = false;
    });
}

// ================================
// TOAST NOTIFICATIONS
// ================================

function showToast(message, type = 'success') {
    const toastElement = document.getElementById('emailToast');
    if (!toastElement) return;
    const toastBody = toastElement.querySelector('.toast-body');
    const toastHeader = toastElement.querySelector('.toast-header');
    
    // Update content based on type
    if (type === 'error') {
        toastHeader.innerHTML = `
            <i class="fas fa-exclamation-circle text-danger me-2"></i>
            <strong class="me-auto">Error</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        `;
        toastElement.classList.add('border-danger');
    } else {
        toastHeader.innerHTML = `
            <i class="fas fa-check-circle text-success me-2"></i>
            <strong class="me-auto">Success!</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        `;
        toastElement.classList.remove('border-danger');
    }
    
    toastBody.textContent = message;
    
    // Show toast
    const toast = new bootstrap.Toast(toastElement, {
        delay: 4000
    });
    toast.show();
}

// ================================
// ANIMATIONS
// ================================

function initializeAnimations() {
    // Add scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animations
    document.querySelectorAll('.feature-item, .countdown-item').forEach(el => {
        observer.observe(el);
    });
    
    // Add hover effects for comic cover
    const comicCover = document.querySelector('.comic-cover');
    if (comicCover) {
        comicCover.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02) rotateY(5deg)';
        });
        
        comicCover.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) rotateY(0deg)';
        });
    }
    
    // Add pulse effect to preorder button on scroll
    const preorderBtn = document.querySelector('.comic-boom-btn');
    let pulseInterval;
    
    const startPulse = () => {
        if (!pulseInterval) {
            pulseInterval = setInterval(() => {
                preorderBtn.classList.add('pulse-extra');
                setTimeout(() => {
                    preorderBtn.classList.remove('pulse-extra');
                }, 1000);
            }, 3000);
        }
    };
    
    const stopPulse = () => {
        if (pulseInterval) {
            clearInterval(pulseInterval);
            pulseInterval = null;
        }
    };
    
    // Observe preorder button
    const preorderObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startPulse();
            } else {
                stopPulse();
            }
        });
    }, { threshold: 0.5 });
    
    if (preorderBtn) {
        preorderObserver.observe(preorderBtn);
    }
}

// ================================
// UTILITY FUNCTIONS
// ================================

// Smooth scroll for anchor links
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

// Format number with leading zeros
function padNumber(num, size) {
    return num.toString().padStart(size, '0');
}

// Debug function for development
function debugMode() {
    console.log('=== MOOG COMIC BINDER DEBUG ===');
    console.log('Countdown target:', new Date('August 24, 2025 00:00:00'));
    console.log('Current time:', new Date());
    console.log('Email input:', document.getElementById('gmailInput')?.value);
    console.log('Form elements loaded:', {
        form: !!document.getElementById('emailForm'),
        input: !!document.getElementById('gmailInput'),
        countdown: !!document.getElementById('countdown')
    });
}

// Add CSS class for additional pulse effect and boom animation
const style = document.createElement('style');
style.textContent = `
    .pulse-extra {
        animation: pulse-extra 1s ease-in-out !important;
    }
    
    @keyframes pulse-extra {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease-out;
    }
    
    .boom-effect {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        animation: boom-appear 0.8s ease-out forwards;
    }
    
    .boom-text {
        font-family: 'Bangers', cursive;
        font-size: 3rem;
        color: #ffff00;
        text-shadow: 
            4px 4px 0 #000,
            -2px -2px 0 #000,
            2px -2px 0 #000,
            -2px 2px 0 #000,
            0 0 20px rgba(255,255,0,0.8);
        letter-spacing: 3px;
        text-align: center;
        animation: boom-text-pop 0.8s ease-out;
    }
    
    .boom-circle {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        border: 5px solid #ff0033;
        border-radius: 50%;
        animation: boom-circle-expand 0.8s ease-out;
    }
    
    .boom-stars {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    
    .boom-stars span {
        position: absolute;
        font-size: 1.5rem;
        color: #ffff00;
        text-shadow: 2px 2px 0 #000;
        animation: boom-stars-scatter 0.8s ease-out;
    }
    
    .boom-stars span:nth-child(1) { top: -30px; left: -20px; animation-delay: 0.1s; }
    .boom-stars span:nth-child(2) { top: -35px; right: -15px; animation-delay: 0.2s; }
    .boom-stars span:nth-child(3) { bottom: -30px; left: -25px; animation-delay: 0.3s; }
    .boom-stars span:nth-child(4) { bottom: -35px; right: -20px; animation-delay: 0.1s; }
    .boom-stars span:nth-child(5) { top: -20px; left: 30px; animation-delay: 0.2s; }
    .boom-stars span:nth-child(6) { bottom: -20px; right: 35px; animation-delay: 0.3s; }
    
    @keyframes boom-appear {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
    
    @keyframes boom-text-pop {
        0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
        50% { transform: scale(1.3) rotate(5deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 0; }
    }
    
    @keyframes boom-circle-expand {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
    }
    
    @keyframes boom-stars-scatter {
        0% { transform: translate(0, 0) scale(0); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translate(var(--x, 0), var(--y, 0)) scale(1.5); opacity: 0; }
    }
    
    @keyframes button-boom-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px) rotate(-2deg); }
        75% { transform: translateX(5px) rotate(2deg); }
    }
`;
document.head.appendChild(style);

// ================================
// FLOATING REMINDER SYSTEM
// ================================

let reminderTimer;
let scrollTriggered = false;
let reminderShown = false;

function initializeFloatingReminder() {
    // Show reminder after 10 seconds of idle time
    reminderTimer = setTimeout(showFloatingReminder, 10000);
    
    // Show reminder on scroll (only once)
    window.addEventListener('scroll', function() {
        if (!scrollTriggered && !reminderShown && window.scrollY > 200) {
            scrollTriggered = true;
            clearTimeout(reminderTimer);
            setTimeout(showFloatingReminder, 2000);
        }
    });
    
    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetReminderTimer, { passive: true });
    });
}

function resetReminderTimer() {
    if (!reminderShown) {
        clearTimeout(reminderTimer);
        reminderTimer = setTimeout(showFloatingReminder, 10000);
    }
}

function showFloatingReminder() {
    if (reminderShown) return;
    
    const reminder = document.getElementById('floatingReminder');
    if (reminder) {
        reminderShown = true;
        reminder.classList.add('show');
        
        // Auto-hide after 15 seconds
        setTimeout(() => {
            if (reminder.classList.contains('show')) {
                hideReminder();
            }
        }, 15000);
    }
}

function hideReminder() {
    const reminder = document.getElementById('floatingReminder');
    if (reminder) {
        reminder.classList.remove('show');
    }
}

function focusEmailInput() {
    hideReminder();
    const emailInput = document.getElementById('gmailInput');
    if (emailInput) {
        emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            emailInput.focus();
        }, 500);
    }
}

// Boom effect for comic buttons
function triggerBoomEffect(button) {
    // Create boom animation container
    const boom = document.createElement('div');
    boom.className = 'boom-effect';
    boom.innerHTML = `
        <div class="boom-text">POW!</div>
        <div class="boom-circle"></div>
        <div class="boom-stars">
            <span>★</span><span>★</span><span>★</span>
            <span>✦</span><span>✦</span><span>✦</span>
        </div>
    `;
    
    // Position boom effect
    const rect = button.getBoundingClientRect();
    boom.style.position = 'fixed';
    boom.style.left = (rect.left + rect.width / 2) + 'px';
    boom.style.top = (rect.top + rect.height / 2) + 'px';
    boom.style.transform = 'translate(-50%, -50%)';
    boom.style.pointerEvents = 'none';
    boom.style.zIndex = '9999';
    
    document.body.appendChild(boom);
    
    // Remove boom effect after animation
    setTimeout(() => {
        if (boom.parentNode) {
            boom.parentNode.removeChild(boom);
        }
    }, 800);
    
    // Add button shake effect
    button.style.animation = 'button-boom-shake 0.3s ease-out';
    setTimeout(() => {
        button.style.animation = '';
    }, 300);
}

// ================================
// ENHANCED EMAIL CAPTURE
// ================================

function captureEmailAndNotify() {
    const emailInput = document.getElementById('gmailInput');
    const email = emailInput.value.trim();
    
    if (!email) {
        emailInput.focus();
        showToast('Please enter your Gmail address first', 'error');
        return;
    }
    
    captureEmail();
}

// Expose functions to global scope
window.hideReminder = hideReminder;
window.focusEmailInput = focusEmailInput;
window.captureEmailAndNotify = captureEmailAndNotify;
window.debugMoog = debugMode;
