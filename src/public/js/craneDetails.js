// Crane Details Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const favoriteBtn = document.querySelector('.hero-favorite');
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail:not(.placeholder)');
    const zoomBtn = document.getElementById('zoomBtn');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const chartViewBtns = document.querySelectorAll('.chart-view-btn');
    
    // Image gallery data
    let currentImageIndex = 0;
    const images = [];
    
    // Initialize
    initializeGallery();
    setupEventListeners();
    
    // Initialize gallery images
    function initializeGallery() {
        // Get all available images from thumbnails
        thumbnails.forEach(thumbnail => {
            const imgSrc = thumbnail.dataset.image;
            if (imgSrc && !images.includes(imgSrc)) {
                images.push(imgSrc);
            }
        });
        
        // Also add main image if it exists
        if (mainImage && mainImage.src) {
            const mainSrc = mainImage.src;
            if (!images.includes(mainSrc)) {
                images.unshift(mainSrc);
            }
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Favorite button
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', toggleFavorite);
        }
        
        // Thumbnail clicks
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', function() {
                const imgSrc = this.dataset.image;
                if (imgSrc && mainImage) {
                    mainImage.src = imgSrc;
                    updateActiveThumbnail(index);
                    currentImageIndex = index;
                }
            });
        });
        
        // Zoom button
        if (zoomBtn) {
            zoomBtn.addEventListener('click', openLightbox);
        }
        
        // Lightbox controls
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', showPrevImage);
        }
        
        if (lightboxNext) {
            lightboxNext.addEventListener('click', showNextImage);
        }
        
        // Chart view buttons
        chartViewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const chartSrc = this.dataset.chart;
                openImageLightbox(chartSrc);
            });
        });
        
        // Close lightbox on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
            if (lightboxModal.style.display === 'flex') {
                if (e.key === 'ArrowLeft') {
                    showPrevImage();
                }
                if (e.key === 'ArrowRight') {
                    showNextImage();
                }
            }
        });
        
        // Close lightbox on backdrop click
        lightboxModal.addEventListener('click', function(e) {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }
    
    // Toggle favorite
    async function toggleFavorite(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const craneId = this.dataset.id;
        const craneName = document.querySelector('.crane-model-title')?.textContent.trim() || 'Crane';
        const isCurrentlyFavorite = this.classList.contains('active');
        
        try {
            // Optimistic UI update
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            
            // Add animation
            this.classList.add('favorite-added');
            setTimeout(() => this.classList.remove('favorite-added'), 300);
            
            // Send API request
            const endpoint = isCurrentlyFavorite ? 
                `/favorites/remove/${craneId}` : 
                `/favorites/add/${craneId}`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                throw new Error('Failed to update favorite');
            }
            
            const result = await response.json();
            
            // Show flash message
            const message = isCurrentlyFavorite ? 
                `"${craneName}" removed from favorites` : 
                `"${craneName}" added to favorites`;
            const type = isCurrentlyFavorite ? 'info' : 'success';
            showFlashMessage(message, type);
            
            // Add glowing effect for new favorite
            if (!isCurrentlyFavorite) {
                this.style.boxShadow = '0 0 30px rgba(249, 212, 0, 0.8)';
                setTimeout(() => {
                    this.style.boxShadow = '';
                }, 1000);
            }
            
        } catch (error) {
            console.error('Error updating favorite:', error);
            // Revert optimistic update
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            
            // Show error notification
            showFlashMessage('Failed to update favorite. Please try again.', 'error');
        }
    }
    
    // Update active thumbnail
    function updateActiveThumbnail(index) {
        thumbnails.forEach((thumb, i) => {
            thumb.classList.remove('active');
            if (i === index) {
                thumb.classList.add('active');
            }
        });
    }
    
    // Open lightbox with current image
    function openLightbox() {
        if (!mainImage || !mainImage.src) return;
        
        // Find current image index
        currentImageIndex = images.findIndex(img => img === mainImage.src);
        if (currentImageIndex === -1) {
            currentImageIndex = 0;
        }
        
        showImageInLightbox(currentImageIndex);
        lightboxModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Open image lightbox with specific image
    function openImageLightbox(imageSrc) {
        const index = images.findIndex(img => img === imageSrc);
        if (index !== -1) {
            currentImageIndex = index;
            showImageInLightbox(currentImageIndex);
            lightboxModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Show image in lightbox
    function showImageInLightbox(index) {
        if (images.length === 0) return;
        
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        
        currentImageIndex = index;
        lightboxImage.src = images[index];
        lightboxCaption.textContent = document.querySelector('.crane-model-title')?.textContent || 'Crane Image';
        lightboxCounter.textContent = `${index + 1} / ${images.length}`;
        
        // Update button visibility
        lightboxPrev.style.visibility = images.length > 1 ? 'visible' : 'hidden';
        lightboxNext.style.visibility = images.length > 1 ? 'visible' : 'hidden';
    }
    
    // Show previous image
    function showPrevImage() {
        showImageInLightbox(currentImageIndex - 1);
    }
    
    // Show next image
    function showNextImage() {
        showImageInLightbox(currentImageIndex + 1);
    }
    
    // Close lightbox
    function closeLightbox() {
        lightboxModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // AR Viewer Functions (from your existing code)
    function preview3DModel(modelUrl) {
        // Implement 3D preview functionality
        showFlashMessage('3D preview feature coming soon', 'info');
    }
    
    // Flash message function
    function showFlashMessage(message, type = 'info') {
        let flashContainer = document.querySelector('.flash-messages');
        if (!flashContainer) {
            flashContainer = document.createElement('div');
            flashContainer.className = 'flash-messages';
            document.body.appendChild(flashContainer);
        }
        
        const flashDiv = document.createElement('div');
        flashDiv.className = `flash-message flash-${type}`;
        flashDiv.innerHTML = `
            <span>${message}</span>
            <button class="flash-close">&times;</button>
        `;
        
        flashContainer.appendChild(flashDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            flashDiv.style.opacity = '0';
            flashDiv.style.transform = 'translateX(100%)';
            setTimeout(() => flashDiv.remove(), 300);
        }, 5000);
        
        // Close button
        const closeBtn = flashDiv.querySelector('.flash-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                flashDiv.style.opacity = '0';
                flashDiv.style.transform = 'translateX(100%)';
                setTimeout(() => flashDiv.remove(), 300);
            });
        }
    }
    
    // Smooth scroll to sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});



// Crane Details Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const favoriteBtn = document.querySelector('.hero-favorite');
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail:not(.placeholder)');
    const zoomBtn = document.getElementById('zoomBtn');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const chartViewBtns = document.querySelectorAll('.chart-view-btn');
    
    // Image gallery data
    let currentImageIndex = 0;
    const images = [];
    
    // Initialize
    initializeGallery();
    setupEventListeners();
    
    // Initialize gallery images
    function initializeGallery() {
        // Get all available images from thumbnails
        thumbnails.forEach(thumbnail => {
            const imgSrc = thumbnail.dataset.image;
            if (imgSrc && !images.includes(imgSrc)) {
                images.push(imgSrc);
            }
        });
        
        // Also add main image if it exists
        if (mainImage && mainImage.src) {
            const mainSrc = mainImage.src;
            if (!images.includes(mainSrc)) {
                images.unshift(mainSrc);
            }
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Favorite button
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', toggleFavorite);
        }
        
        // Thumbnail clicks
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', function() {
                const imgSrc = this.dataset.image;
                if (imgSrc && mainImage) {
                    mainImage.src = imgSrc;
                    updateActiveThumbnail(index);
                    currentImageIndex = index;
                }
            });
        });
        
        // Zoom button
        if (zoomBtn) {
            zoomBtn.addEventListener('click', openLightbox);
        }
        
        // Lightbox controls
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', showPrevImage);
        }
        
        if (lightboxNext) {
            lightboxNext.addEventListener('click', showNextImage);
        }
        
        // Chart view buttons
        chartViewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const chartSrc = this.dataset.chart;
                openImageLightbox(chartSrc);
            });
        });
        
        // AR View buttons - both for details page and cards
        document.querySelectorAll('.ar-view-btn, .ar-preview-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const arLink = this.dataset.arLink || this.getAttribute('href');
                if (arLink) {
                    // Check if AR viewer function exists
                    if (typeof window.launchARViewer === 'function') {
                        window.launchARViewer(arLink);
                    } else {
                        // Fallback: open in new tab
                        window.open(arLink, '_blank');
                        showFlashMessage('Opening AR model in new tab', 'info');
                    }
                }
            });
        });
        
        // Close lightbox on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
            if (lightboxModal.style.display === 'flex') {
                if (e.key === 'ArrowLeft') {
                    showPrevImage();
                }
                if (e.key === 'ArrowRight') {
                    showNextImage();
                }
            }
        });
        
        // Close lightbox on backdrop click
        lightboxModal.addEventListener('click', function(e) {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
        
        // Remove inline onclick handlers and add proper event listeners
        document.querySelectorAll('[onclick*="preview3DModel"]').forEach(btn => {
            btn.removeAttribute('onclick');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const modelUrl = this.dataset.modelUrl || 
                                this.getAttribute('href') || 
                                this.closest('[data-ar-link]')?.dataset.arLink;
                if (modelUrl) {
                    preview3DModel(modelUrl);
                }
            });
        });
    }
    
    // Toggle favorite
    async function toggleFavorite(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const craneId = this.dataset.id;
        const craneName = document.querySelector('.crane-model-title')?.textContent.trim() || 'Crane';
        const isCurrentlyFavorite = this.classList.contains('active');
        
        try {
            // Optimistic UI update
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            
            // Add animation
            this.classList.add('favorite-added');
            setTimeout(() => this.classList.remove('favorite-added'), 300);
            
            // Send API request
            const endpoint = isCurrentlyFavorite ? 
                `/favorites/remove/${craneId}` : 
                `/favorites/add/${craneId}`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                throw new Error('Failed to update favorite');
            }
            
            const result = await response.json();
            
            // Show flash message
            const message = isCurrentlyFavorite ? 
                `"${craneName}" removed from favorites` : 
                `"${craneName}" added to favorites`;
            const type = isCurrentlyFavorite ? 'info' : 'success';
            showFlashMessage(message, type);
            
            // Add glowing effect for new favorite
            if (!isCurrentlyFavorite) {
                this.style.boxShadow = '0 0 30px rgba(249, 212, 0, 0.8)';
                setTimeout(() => {
                    this.style.boxShadow = '';
                }, 1000);
            }
            
        } catch (error) {
            console.error('Error updating favorite:', error);
            // Revert optimistic update
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            
            // Show error notification
            showFlashMessage('Failed to update favorite. Please try again.', 'error');
        }
    }
    
    // Update active thumbnail
    function updateActiveThumbnail(index) {
        thumbnails.forEach((thumb, i) => {
            thumb.classList.remove('active');
            if (i === index) {
                thumb.classList.add('active');
            }
        });
    }
    
    // Open lightbox with current image
    function openLightbox() {
        if (!mainImage || !mainImage.src) return;
        
        // Find current image index
        currentImageIndex = images.findIndex(img => img === mainImage.src);
        if (currentImageIndex === -1) {
            currentImageIndex = 0;
        }
        
        showImageInLightbox(currentImageIndex);
        lightboxModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // Open image lightbox with specific image
    function openImageLightbox(imageSrc) {
        const index = images.findIndex(img => img === imageSrc);
        if (index !== -1) {
            currentImageIndex = index;
            showImageInLightbox(currentImageIndex);
            lightboxModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Show image in lightbox
    function showImageInLightbox(index) {
        if (images.length === 0) return;
        
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        
        currentImageIndex = index;
        lightboxImage.src = images[index];
        lightboxCaption.textContent = document.querySelector('.crane-model-title')?.textContent || 'Crane Image';
        lightboxCounter.textContent = `${index + 1} / ${images.length}`;
        
        // Update button visibility
        lightboxPrev.style.visibility = images.length > 1 ? 'visible' : 'hidden';
        lightboxNext.style.visibility = images.length > 1 ? 'visible' : 'hidden';
    }
    
    // Show previous image
    function showPrevImage() {
        showImageInLightbox(currentImageIndex - 1);
    }
    
    // Show next image
    function showNextImage() {
        showImageInLightbox(currentImageIndex + 1);
    }
    
    // Close lightbox
    function closeLightbox() {
        lightboxModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // Flash message function
    function showFlashMessage(message, type = 'info') {
        let flashContainer = document.querySelector('.flash-messages');
        if (!flashContainer) {
            flashContainer = document.createElement('div');
            flashContainer.className = 'flash-messages';
            document.body.appendChild(flashContainer);
        }
        
        const flashDiv = document.createElement('div');
        flashDiv.className = `flash-message flash-${type}`;
        flashDiv.innerHTML = `
            <span>${message}</span>
            <button class="flash-close">&times;</button>
        `;
        
        flashContainer.appendChild(flashDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            flashDiv.style.opacity = '0';
            flashDiv.style.transform = 'translateX(100%)';
            setTimeout(() => flashDiv.remove(), 300);
        }, 5000);
        
        // Close button
        const closeBtn = flashDiv.querySelector('.flash-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                flashDiv.style.opacity = '0';
                flashDiv.style.transform = 'translateX(100%)';
                setTimeout(() => flashDiv.remove(), 300);
            });
        }
    }
    
    // Smooth scroll to sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Define preview3DModel function to fix the ReferenceError
window.preview3DModel = function(modelUrl) {
    // Simple 3D preview implementation
    showFlashMessage('3D preview feature coming soon', 'info');
    console.log('3D Preview requested for:', modelUrl);
    
    // You can implement actual 3D preview here using libraries like:
    // - Three.js
    // - Model Viewer (same as AR viewer)
    // - Or open in new tab
};

// Only define launchARViewer as a fallback if it doesn't exist
if (typeof window.launchARViewer === 'undefined') {
    window.launchARViewer = function(arPathOrUrl) {
        // Simple fallback if AR viewer isn't loaded
        showFlashMessage('Opening AR model in new tab', 'info');
        window.open(arPathOrUrl, '_blank');
    };
}

// Helper function for flash messages (if called from global context)
function showFlashMessage(message, type = 'info') {
    console.log(`${type}: ${message}`);
    // You might want to implement a global flash message system
    // or ensure this function exists in the global scope
}