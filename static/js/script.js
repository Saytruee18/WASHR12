// ================================
// MOOG COMIC BINDER - JavaScript
// ================================

document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializeAnimations();
    initializeEmailForm();
    console.log('MOOG Comic Binder loaded successfully!');
});

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
    const button = document.querySelector('.email-btn');
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
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
    const preorderBtn = document.querySelector('.preorder-btn');
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

// Add CSS class for additional pulse effect
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
`;
document.head.appendChild(style);

// Expose debug function to global scope for testing
window.debugMoog = debugMode;
