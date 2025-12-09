// Crane Catalog Functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('craneSearch');
    const clearSearch = document.getElementById('clearSearch');
    const typeFilter = document.getElementById('typeFilter');
    const capacityFilter = document.getElementById('capacityFilter');
    const manufacturerFilter = document.getElementById('manufacturerFilter');
    const clearFilters = document.getElementById('clearFilters');
    const craneCards = document.querySelectorAll('.crane-card');
    const cranesGrid = document.getElementById('cranesGrid');
    const craneCount = document.getElementById('craneCount');
    const emptyState = document.getElementById('emptyState');
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');
    const showFavoritesBtn = document.getElementById('showFavoritesOnly');
    const resetAllBtn = document.getElementById('resetAll');
    const activeFilters = document.getElementById('activeFilters');
    const filterChips = document.getElementById('filterChips');

    // State variables
    let currentFilters = {
        search: '',
        type: '',
        capacity: '',
        manufacturer: '',
        favoritesOnly: false
    };

    // Initialize
    initFilters();
    setupEventListeners();
    updateCraneCount();

    // Initialize filters from URL parameters
    function initFilters() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('type')) {
            typeFilter.value = params.get('type');
            currentFilters.type = typeFilter.value;
        }
        
        if (params.has('capacity')) {
            capacityFilter.value = params.get('capacity');
            currentFilters.capacity = capacityFilter.value;
        }
        
        if (params.has('manufacturer')) {
            manufacturerFilter.value = params.get('manufacturer');
            currentFilters.manufacturer = manufacturerFilter.value;
        }
        
        if (params.has('search')) {
            searchInput.value = params.get('search');
            currentFilters.search = params.get('search');
            searchInput.parentElement.classList.add('has-input');
        }
        
        updateActiveFilters();
        filterCranes();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Search input with debounce
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = e.target.value.toLowerCase().trim();
                updateSearchUI();
                updateActiveFilters();
                filterCranes();
                updateURL();
            }, 300);
        });

        // Clear search button
        clearSearch.addEventListener('click', function() {
            searchInput.value = '';
            currentFilters.search = '';
            updateSearchUI();
            updateActiveFilters();
            filterCranes();
            updateURL();
            searchInput.focus();
        });

        // Filter dropdowns
        [typeFilter, capacityFilter, manufacturerFilter].forEach(filter => {
            filter.addEventListener('change', function() {
                currentFilters[this.id.replace('Filter', '')] = this.value;
                updateActiveFilters();
                filterCranes();
                updateURL();
            });
        });

        // Clear all filters
        clearFilters.addEventListener('click', resetFilters);
        
        // Reset all button in empty state
        if (resetAllBtn) {
            resetAllBtn.addEventListener('click', resetFilters);
        }

        // View toggle buttons
        gridViewBtn.addEventListener('click', function() {
            setViewMode('grid');
        });

        listViewBtn.addEventListener('click', function() {
            setViewMode('list');
        });

        // Show favorites only
        showFavoritesBtn.addEventListener('click', function() {
            currentFilters.favoritesOnly = !currentFilters.favoritesOnly;
            this.classList.toggle('active', currentFilters.favoritesOnly);
            
            if (currentFilters.favoritesOnly) {
                this.innerHTML = '<i class="fas fa-heart"></i> Show All';
            } else {
                this.innerHTML = '<i class="fas fa-heart"></i> Show Favorites';
            }
            
            filterCranes();
        });

        // Initialize favorite buttons
        initializeFavoriteButtons();
    }

    // Update search UI
    function updateSearchUI() {
        if (currentFilters.search) {
            searchInput.parentElement.classList.add('has-input');
        } else {
            searchInput.parentElement.classList.remove('has-input');
        }
    }

    // Update active filters display
    function updateActiveFilters() {
        const activeFiltersList = [];
        
        if (currentFilters.type) {
            activeFiltersList.push({
                label: `Type: ${typeFilter.options[typeFilter.selectedIndex].text}`,
                key: 'type'
            });
        }
        
        if (currentFilters.capacity) {
            activeFiltersList.push({
                label: `Capacity: ${capacityFilter.options[capacityFilter.selectedIndex].text}`,
                key: 'capacity'
            });
        }
        
        if (currentFilters.manufacturer) {
            activeFiltersList.push({
                label: `Manufacturer: ${manufacturerFilter.options[manufacturerFilter.selectedIndex].text}`,
                key: 'manufacturer'
            });
        }
        
        if (currentFilters.search) {
            activeFiltersList.push({
                label: `Search: "${currentFilters.search}"`,
                key: 'search'
            });
        }

        if (activeFiltersList.length > 0) {
            activeFilters.style.display = 'block';
            filterChips.innerHTML = activeFiltersList.map(filter => `
                <div class="filter-chip">
                    <span>${filter.label}</span>
                    <button onclick="removeFilter('${filter.key}')" aria-label="Remove filter">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        } else {
            activeFilters.style.display = 'none';
            filterChips.innerHTML = '';
        }
    }

    // Remove specific filter
    window.removeFilter = function(filterKey) {
        switch(filterKey) {
            case 'type':
                typeFilter.value = '';
                currentFilters.type = '';
                break;
            case 'capacity':
                capacityFilter.value = '';
                currentFilters.capacity = '';
                break;
            case 'manufacturer':
                manufacturerFilter.value = '';
                currentFilters.manufacturer = '';
                break;
            case 'search':
                searchInput.value = '';
                currentFilters.search = '';
                updateSearchUI();
                break;
        }
        
        updateActiveFilters();
        filterCranes();
        updateURL();
    };

    // Reset all filters
    function resetFilters() {
        // Reset form inputs
        searchInput.value = '';
        typeFilter.value = '';
        capacityFilter.value = '';
        manufacturerFilter.value = '';
        
        // Reset current filters state
        currentFilters = {
            search: '',
            type: '',
            capacity: '',
            manufacturer: '',
            favoritesOnly: false
        };
        
        // Reset UI
        updateSearchUI();
        showFavoritesBtn.classList.remove('active');
        showFavoritesBtn.innerHTML = '<i class="fas fa-heart"></i> Show Favorites';
        
        // Update display
        updateActiveFilters();
        filterCranes();
        updateURL();
    }

    // Filter cranes based on current filters
    function filterCranes() {
        let visibleCount = 0;
        
        craneCards.forEach(card => {
            const matchesSearch = currentFilters.search === '' || 
                card.dataset.id.toLowerCase().includes(currentFilters.search) ||
                card.querySelector('.crane-model').textContent.toLowerCase().includes(currentFilters.search) ||
                card.querySelector('.crane-manufacturer').textContent.toLowerCase().includes(currentFilters.search) ||
                card.dataset.type.toLowerCase().includes(currentFilters.search);
            
            const matchesType = currentFilters.type === '' || 
                card.dataset.type === currentFilters.type;
            
            const matchesManufacturer = currentFilters.manufacturer === '' || 
                card.dataset.manufacturer === currentFilters.manufacturer;
            
            const matchesCapacity = currentFilters.capacity === '' || 
                checkCapacityRange(card.dataset.capacity, currentFilters.capacity);
            
            const isFavorite = card.querySelector('.favorite-btn').classList.contains('active');
            const matchesFavorites = !currentFilters.favoritesOnly || isFavorite;
            
            const shouldShow = matchesSearch && matchesType && matchesManufacturer && 
                            matchesCapacity && matchesFavorites;
            
            if (shouldShow) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update crane count
        craneCount.textContent = visibleCount;
        
        // Show/hide empty state
        if (visibleCount === 0) {
            emptyState.style.display = 'block';
            cranesGrid.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            cranesGrid.style.display = 'grid';
        }
    }

    // Check if capacity matches selected range
    function checkCapacityRange(capacity, range) {
        const cap = parseInt(capacity) || 0;
        
        switch(range) {
            case '0-10':
                return cap >= 0 && cap <= 10;
            case '10-100':
                return cap > 10 && cap <= 100;
            case '100-500':
                return cap > 100 && cap <= 500;
            case '500-1000':
                return cap > 500 && cap <= 1000;
            case '1000+':
                return cap > 1000;
            default:
                return true;
        }
    }

    // Update URL with current filters
    function updateURL() {
        const params = new URLSearchParams();
        
        if (currentFilters.search) params.set('search', currentFilters.search);
        if (currentFilters.type) params.set('type', currentFilters.type);
        if (currentFilters.capacity) params.set('capacity', currentFilters.capacity);
        if (currentFilters.manufacturer) params.set('manufacturer', currentFilters.manufacturer);
        
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, '', newUrl);
    }

    // Set view mode (grid or list)
    function setViewMode(mode) {
        if (mode === 'grid') {
            cranesGrid.classList.remove('list-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        } else {
            cranesGrid.classList.add('list-view');
            gridViewBtn.classList.remove('active');
            listViewBtn.classList.add('active');
        }
    }

    // Update crane count display
    function updateCraneCount() {
        craneCount.textContent = document.querySelectorAll('.crane-card').length;
    }

    // Initialize favorite buttons functionality
    function initializeFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const craneId = this.dataset.id;
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
                    
                    // Update filters if showing favorites only
                    if (currentFilters.favoritesOnly) {
                        filterCranes();
                    }
                    
                } catch (error) {
                    console.error('Error updating favorite:', error);
                    // Revert optimistic update
                    this.classList.toggle('active');
                    const icon = this.querySelector('i');
                    icon.classList.toggle('far');
                    icon.classList.toggle('fas');
                    
                    // Show error notification
                    showNotification('Failed to update favorite. Please try again.', 'error');
                }
            });
        });
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Check if notification container exists
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;
        
        notificationContainer.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // AR Preview buttons
    document.querySelectorAll('.ar-preview-btn').forEach(button => {
        button.addEventListener('click', function() {
            const arLink = this.dataset.arLink;
            if (arLink) {
                // Open AR modal or link
                if (typeof window.openARModal === 'function') {
                    window.openARModal(arLink);
                } else {
                    window.open(arLink, '_blank');
                }
            }
        });
    });
});

// Add notification styles dynamically
const notificationStyles = `
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
}

.notification {
    background: var(--glass-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    backdrop-filter: blur(10px);
    animation: slideIn 0.3s ease;
    transition: all 0.3s ease;
}

.notification-error {
    border-left: 4px solid #ff4757;
}

.notification-error i {
    color: #ff4757;
}

.notification-success {
    border-left: 4px solid var(--crane-yellow);
}

.notification-success i {
    color: var(--crane-yellow);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);