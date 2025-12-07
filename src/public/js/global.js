/**
 * CraneOpedia - Global JavaScript
 * Modern industrial UI interactions and animations
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavbar();
    initThemeToggle();
    initFlashMessages();
    initFloatingButton();
    initNewsletterForm();
    initPreloader();
    initPageTransitions();
    updateCopyrightYear();
});

/**
 * Navbar Mobile Toggle
 */
function initNavbar() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
            
            // Update aria-expanded for accessibility
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
        
        // Close menu when clicking overlay
        mobileOverlay.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
            navToggle.setAttribute('aria-expanded', 'false');
        });
        
        // Close menu when clicking a link (mobile)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 820) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    mobileOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
        
        // Add active state to nav links on scroll
        initScrollSpy();
    }
}

/**
 * Scroll Spy for Active Navigation
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);
        
        sections.forEach(section => observer.observe(section));
    }
}

/**
 * Theme Toggle Functionality
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    if (themeToggle) {
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('cranepedia-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            html.setAttribute('data-theme', savedTheme);
        } else if (systemPrefersDark) {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('cranepedia-theme', 'dark');
        }
        
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('cranepedia-theme', newTheme);
            
            // Add animation class for smooth transition
            html.classList.add('theme-transition');
            setTimeout(() => {
                html.classList.remove('theme-transition');
            }, 300);
            
            // Dispatch custom event for other components
            document.dispatchEvent(new CustomEvent('themeChange', { detail: newTheme }));
        });
    }
}

/**
 * Flash Messages Management
 */
function initFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach(message => {
        const closeBtn = message.querySelector('.flash-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                message.style.animation = 'slideInRight 0.3s ease reverse forwards';
                setTimeout(() => {
                    message.remove();
                }, 300);
            });
        }
        
        // Auto-remove flash messages after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.style.opacity = '0';
                message.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.remove();
                    }
                }, 300);
            }
        }, 5000);
    });
}

/**
 * Floating Compare Button Animation
 */
function initFloatingButton() {
    const compareBtn = document.getElementById('compareBtn');
    
    if (compareBtn) {
        compareBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add click animation
            compareBtn.classList.add('clicked');
            setTimeout(() => {
                compareBtn.classList.remove('clicked');
            }, 300);
            
            // Scroll to compare section or show modal
            const compareSection = document.getElementById('compare-section');
            if (compareSection) {
                compareSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Show compare modal (would be implemented in page-specific JS)
                if (typeof showCompareModal === 'function') {
                    showCompareModal();
                }
            }
        });
        
        // Add parallax effect on scroll
        window.addEventListener('scroll', function() {
            if (compareBtn) {
                const scrolled = window.pageYOffset;
                const rate = scrolled * 0.1;
                compareBtn.style.transform = `translateY(${rate}px)`;
            }
        });
    }
}

/**
 * Newsletter Form Handling
 */
function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('.newsletter-input');
            const submitBtn = this.querySelector('.newsletter-btn');
            const originalText = submitBtn.innerHTML;
            
            // Basic email validation
            const email = emailInput.value.trim();
            if (!isValidEmail(email)) {
                showFormError(emailInput, 'Please enter a valid email address');
                return;
            }
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;
            
            // Simulate API call (replace with actual fetch)
            setTimeout(() => {
                // Show success message
                showFlashMessage('Successfully subscribed to newsletter!', 'success');
                
                // Reset form
                emailInput.value = '';
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Animate success
                submitBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                }, 2000);
            }, 1500);
        });
        
        // Add input validation
        const emailInput = newsletterForm.querySelector('.newsletter-input');
        emailInput.addEventListener('input', function() {
            this.classList.remove('error');
        });
    }
}

/**
 * Preloader Animation
 */
function initPreloader() {
    const preloader = document.querySelector('.preloader');
    
    if (preloader) {
        // Show preloader for minimum 1 second for smooth experience
        setTimeout(() => {
            preloader.classList.add('loaded');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.remove();
                }
            }, 500);
        }, 1000);
        
        // Force hide if page takes too long to load
        setTimeout(() => {
            if (preloader && !preloader.classList.contains('loaded')) {
                preloader.classList.add('loaded');
            }
        }, 3000);
    }
}

/**
 * Smooth Page Transitions
 */
function initPageTransitions() {
    // Add fade-in animation to main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            mainContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Animate elements with data-animate attribute
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
}

/**
 * Update Copyright Year Automatically
 */
function updateCopyrightYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/**
 * Show Flash Message Programmatically
 */
function showFlashMessage(message, type = 'info') {
    const flashContainer = document.getElementById("flashContainer");
    
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message flash-${type}`;
    flashMessage.innerHTML = `
        <span>${message}</span>
        <button class="flash-close">&times;</button>
    `;
    
    flashContainer.appendChild(flashMessage);
    initFlashMessages(); // Re-initialize for new message
}

/**
 * Create Flash Container if it doesn't exist
 */
function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-messages';
    document.body.appendChild(container);
    return container;
}

/**
 * Email Validation Helper
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show Form Error
 */
function showFormError(inputElement, message) {
    inputElement.classList.add('error');
    
    // Remove existing error
    const existingError = inputElement.parentNode.querySelector('.form-error');
    if (existingError) existingError.remove();
    
    // Create error message
    const errorElement = document.createElement('span');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #E74C3C;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        display: block;
    `;
    
    inputElement.parentNode.appendChild(errorElement);
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for scroll events
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Add global event listeners
window.addEventListener('resize', debounce(function() {
    // Handle responsive adjustments
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.getElementById('navToggle');
    
    if (window.innerWidth > 820 && navMenu) {
        navMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
}, 250));

// Export functions for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNavbar,
        initThemeToggle,
        showFlashMessage,
        isValidEmail
    };
}