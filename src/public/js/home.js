/**
 * CraneOpedia Home Page JavaScript
 * Handles dynamic dropdowns, comparison table, and load analysis
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initDropdowns();
    initComparisonTable();
    initLoadAnalysis();
    setupEventListeners();
});

/**
 * Initialize Dynamic Dropdowns
 */
function initDropdowns() {
    const typeSelect = document.getElementById('craneType');
    const manufacturerSelect = document.getElementById('craneManufacturer');
    const modelSelect = document.getElementById('craneModel');
    const manufacturerLoader = document.getElementById('manufacturerLoader');
    const modelLoader = document.getElementById('modelLoader');
    const addButton = document.getElementById('addToComparison');
    const selectedPreview = document.getElementById('selectedPreview');
    const manufacturerStatus = document.getElementById('manufacturerStatus');
    const modelStatus = document.getElementById('modelStatus');

    let selectedCrane = null;
    let manufacturersCache = {};
    let modelsCache = {};

    // Type Change Event
    typeSelect.addEventListener('change', async function() {
        const typeId = this.value;
        
        if (!typeId) {
            manufacturerSelect.disabled = true;
            manufacturerSelect.innerHTML = '<option value="">Select Manufacturer</option>';
            modelSelect.disabled = true;
            modelSelect.innerHTML = '<option value="">Select Model</option>';
            manufacturerStatus.textContent = 'Select type first';
            modelStatus.textContent = 'Select manufacturer first';
            addButton.disabled = true;
            selectedPreview.style.display = 'none';
            return;
        }

        // Show loader
        manufacturerLoader.style.display = 'block';
        manufacturerSelect.disabled = true;
        manufacturerStatus.textContent = 'Loading manufacturers...';

        try {
            // Check cache first
            if (manufacturersCache[typeId]) {
                populateManufacturers(manufacturersCache[typeId]);
            } else {
                // Fetch manufacturers for selected type
                const response = await fetch(`/manufacturers/${encodeURIComponent(typeId)}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const manufacturers = await response.json();
                
                // Cache the results
                manufacturersCache[typeId] = manufacturers;
                populateManufacturers(manufacturers);
            }
        } catch (error) {
            console.error('Error loading manufacturers:', error);
            manufacturerStatus.textContent = 'Error loading manufacturers';
            showFlashMessage('Error loading manufacturers. Please try again.', 'error');
        } finally {
            manufacturerLoader.style.display = 'none';
        }

        // Clear model selection
        modelSelect.disabled = true;
        modelSelect.innerHTML = '<option value="">Select Model</option>';
        modelStatus.textContent = 'Select manufacturer first';
        addButton.disabled = true;
        selectedPreview.style.display = 'none';
    });

    // Manufacturer Change Event
    manufacturerSelect.addEventListener('change', async function() {
        const typeId = typeSelect.value;
        const manufacturer = this.value;
        
        if (!manufacturer) {
            modelSelect.disabled = true;
            modelSelect.innerHTML = '<option value="">Select Model</option>';
            modelStatus.textContent = 'Select manufacturer first';
            addButton.disabled = true;
            selectedPreview.style.display = 'none';
            return;
        }

        // Show loader
        modelLoader.style.display = 'block';
        modelSelect.disabled = true;
        modelStatus.textContent = 'Loading models...';

        try {
            const cacheKey = `${typeId}_${manufacturer}`;
            
            // Check cache first
            if (modelsCache[cacheKey]) {
                populateModels(modelsCache[cacheKey]);
            } else {
                // Fetch models for selected manufacturer
                const response = await fetch(`/models/${encodeURIComponent(typeId)}/${encodeURIComponent(manufacturer)}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const models = await response.json();
                
                // Cache the results
                modelsCache[cacheKey] = models;
                populateModels(models);
            }
        } catch (error) {
            console.error('Error loading models:', error);
            modelStatus.textContent = 'Error loading models';
            showFlashMessage('Error loading models. Please try again.', 'error');
        } finally {
            modelLoader.style.display = 'none';
        }

        addButton.disabled = true;
        selectedPreview.style.display = 'none';
    });

    // Model Change Event
    modelSelect.addEventListener('change', async function() {
        const modelId = this.value;
        const selectedOption = this.options[this.selectedIndex];
        
        if (!modelId) {
            addButton.disabled = true;
            selectedPreview.style.display = 'none';
            return;
        }

        try {
            // Fetch crane details
            const response = await fetch(`/cranes/${modelId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Extract crane object from response - your API returns {crane: {...}}
            const crane = data.crane;
            
            if (!crane) {
                showFlashMessage('Crane not found', 'error');
                return;
            }
            
            // Store selected crane
            selectedCrane = crane;
            
            // Update preview
            updateSelectedPreview(crane);
            
            // Enable add button
            addButton.disabled = false;
            selectedPreview.style.display = 'block';
        } catch (error) {
            console.error('Error loading crane details:', error);
            showFlashMessage('Error loading crane details', 'error');
        }
    });

    // Populate Manufacturers Dropdown
    function populateManufacturers(manufacturers) {
        manufacturerSelect.innerHTML = '<option value="">Select Manufacturer</option>';
        
        if (!Array.isArray(manufacturers)) {
            console.error('Manufacturers data is not an array:', manufacturers);
            manufacturerStatus.textContent = 'Error: Invalid data format';
            return;
        }
        
        manufacturers.forEach(manufacturer => {
            const option = document.createElement('option');
            
            // Your API returns objects with _id and name
            option.value = manufacturer._id || manufacturer.name;
            option.textContent = manufacturer.name || manufacturer._id;
            
            manufacturerSelect.appendChild(option);
        });
        
        manufacturerSelect.disabled = false;
        manufacturerStatus.textContent = `${manufacturers.length} manufacturers found`;
    }

    // Populate Models Dropdown
    function populateModels(models) {
        modelSelect.innerHTML = '<option value="">Select Model</option>';
        
        if (!Array.isArray(models)) {
            console.error('Models data is not an array:', models);
            modelStatus.textContent = 'Error: Invalid data format';
            return;
        }
        
        models.forEach(model => {
            const option = document.createElement('option');
            
            // Your API returns objects with model details
            option.value = model._id;
            
            // Create display text
            let displayText = model.model || 'Unknown Model';
            if (model.max_load_capacity) {
                displayText += ` - ${model.max_load_capacity}`;
            }
            if (model.boom_length) {
                displayText += ` (${model.boom_length} boom)`;
            }
            option.textContent = displayText;
            
            // Store data for preview
            option.dataset.capacity = model.max_load_capacity || '';
            option.dataset.boomLength = model.boom_length || '';
            option.dataset.image = model.image || '';
            option.dataset.manufacturer = model.manufacturer || '';
            option.dataset.type = model.type || '';
            
            modelSelect.appendChild(option);
        });
        
        modelSelect.disabled = false;
        modelStatus.textContent = `${models.length} models found`;
    }

    // Update Selected Crane Preview
    function updateSelectedPreview(crane) {
        const selectedImage = document.getElementById('selectedImage');
        const selectedModel = document.getElementById('selectedModel');
        const selectedSpecs = document.getElementById('selectedSpecs');
        
        if (selectedImage) {
            selectedImage.src = crane.image || '/images/default-crane.jpg';
            selectedImage.alt = crane.model || 'Crane';
        }
        
        if (selectedModel) {
            selectedModel.textContent = crane.model || 'Unknown Model';
        }
        
        if (selectedSpecs) {
            const specs = [];
            if (crane.max_load_capacity) specs.push(`Capacity: ${crane.max_load_capacity}`);
            if (crane.boom_length) specs.push(`Boom: ${crane.boom_length}`);
            if (crane.manufacturer) specs.push(`Manufacturer: ${crane.manufacturer}`);
            if (crane.type) specs.push(`Type: ${crane.type}`);
            
            selectedSpecs.textContent = specs.join(' • ') || 'No specifications available';
        }
    }

    // Add to Comparison Button
    addButton.addEventListener('click', async function() {
        if (!selectedCrane) return;
        console.log('Add to Comparison clicked');
        // Check if crane is already in comparison
        const existingCrane = document.querySelector(`[data-crane-id="${selectedCrane._id}"]`);
        if (existingCrane) {
            showFlashMessage('This crane is already in comparison', 'warning');
            return;
        }
        
        // Check comparison limit
        const comparisonCount = document.querySelectorAll('.comparison-column:not(.add-column)').length;
        if (comparisonCount >= 5) {
            showFlashMessage('Maximum 5 cranes allowed in comparison', 'error');
            return;
        }
        
        try {
            // Add to comparison via POST
            const response = await fetch('/compare/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ craneId: selectedCrane._id })
            });
            
            if (response.ok) {
                const result = await response.json();
                showFlashMessage('Crane added to comparison', 'success');
                
                // Update comparison table (GLOBAL function)
                if (typeof window.addCraneToComparison === 'function') {
                    window.addCraneToComparison(result.crane);
                    window.addCraneToComparisonTable(result.crane); 
                }
                
                // Clear selection
                clearSelection();
            } else {
                const error = await response.json();
                showFlashMessage(error.error || 'Error adding crane to comparison', 'error');
            }
        } catch (error) {
            console.error('Error adding to comparison:', error);
            showFlashMessage('Error adding crane to comparison', 'error');
        }
    });

    // Clear Selection Button
    document.getElementById('clearSelection').addEventListener('click', clearSelection);

    function clearSelection() {
        typeSelect.value = '';
        manufacturerSelect.innerHTML = '<option value="">Select Manufacturer</option>';
        manufacturerSelect.disabled = true;
        modelSelect.innerHTML = '<option value="">Select Model</option>';
        modelSelect.disabled = true;
        addButton.disabled = true;
        selectedPreview.style.display = 'none';
        selectedCrane = null;
        
        manufacturerStatus.textContent = 'Select type first';
        modelStatus.textContent = 'Select manufacturer first';
    }
}

/**
 * Initialize Comparison Table
 */
function initComparisonTable() {
    const comparisonContainer = document.getElementById('comparisonContainer');
    const comparisonTable = document.getElementById('comparisonTable');
    const emptyComparison = document.getElementById('emptyComparison');
    const comparisonActions = document.getElementById('comparisonActions');
    const comparisonCount = document.getElementById('comparisonCount');
    const startComparisonBtn = document.getElementById('startComparison');

    // Remove Crane from Comparison
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.remove-btn')) {
            const removeBtn = e.target.closest('.remove-btn');
            const craneId = removeBtn.dataset.craneId;
            
            try {
                const response = await fetch(`/compare/remove/${craneId}`, {
                    method: 'POST'
                });
                
                if (response.ok) {
                    showFlashMessage('Crane removed from comparison', 'info');
                    
                    // Remove from UI
                    const column = removeBtn.closest('.comparison-column');
                    column.style.animation = 'slideIn 0.3s ease reverse forwards';
                    setTimeout(() => {
                        column.remove();
                        updateComparisonUI();
                    }, 300);
                }
            } catch (error) {
                console.error('Error removing crane:', error);
                showFlashMessage('Error removing crane', 'error');
            }
        }
    });

    // Add Column Click
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-column')) {
            // Scroll to search section
            document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
            
            // Highlight search form
            const searchCard = document.querySelector('.search-card');
            searchCard.style.animation = 'highlight 1s ease';
            setTimeout(() => {
                searchCard.style.animation = '';
            }, 1000);
        }
    });

    // Start Comparison Button
    if (startComparisonBtn) {
        startComparisonBtn.addEventListener('click', function() {
            document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Export Comparison
    document.getElementById('exportComparison')?.addEventListener('click', function() {
        exportComparison();
    });

    // Clear All Comparison
    document.getElementById('clearComparison')?.addEventListener('click', async function() {
        if (confirm('Are you sure you want to clear all cranes from comparison?')) {
            try {
                const response = await fetch('/compare/clear', {
                    method: 'POST'
                });
                
                if (response.ok) {
                    showFlashMessage('Comparison cleared', 'info');
                    
                    // Clear UI
                    const columns = document.querySelectorAll('.comparison-column:not(.add-column)');
                    columns.forEach(column => {
                        column.style.animation = 'slideIn 0.3s ease reverse forwards';
                        setTimeout(() => column.remove(), 300);
                    });
                    
                    updateComparisonUI();
                }
            } catch (error) {
                console.error('Error clearing comparison:', error);
                showFlashMessage('Error clearing comparison', 'error');
            }
        }
    });

    // Contact Owner Button
    document.addEventListener('click', function(e) {
        if (e.target.closest('.contact-btn')) {
            const craneId = e.target.closest('.contact-btn').dataset.craneId;
            showContactModal(craneId);
        }
    });

    // AR Button
    document.addEventListener('click', function(e) {
        if (e.target.closest('.ar-btn')) {
            const arModel = e.target.closest('.ar-btn').dataset.arModel;
            launchARViewer(arModel);
        }
    });

    // Update Comparison UI
    function updateComparisonUI() {
        const columns = document.querySelectorAll('.comparison-column:not(.add-column)');
        const count = columns.length;
        
        // Update count
        if (comparisonCount) {
            comparisonCount.textContent = `(${count}/5)`;
        }
        
        // Show/hide empty state
        if (count === 0) {
            if (emptyComparison) emptyComparison.style.display = 'flex';
            if (comparisonTable) comparisonTable.style.display = 'none';
            if (comparisonActions) comparisonActions.style.display = 'none';
        } else {
            if (emptyComparison) emptyComparison.style.display = 'none';
            if (comparisonTable) comparisonTable.style.display = 'flex';
            if (comparisonActions) comparisonActions.style.display = 'flex';
            
            // Show/hide add column
            const addColumn = document.querySelector('.add-column');
            if (count >= 5 && addColumn) {
                addColumn.remove();
            } else if (count < 5 && !addColumn && comparisonTable) {
                comparisonTable.appendChild(createAddColumn());
            }
        }
        
        // Enable/disable actions
        const exportBtn = document.getElementById('exportComparison');
        if (exportBtn) {
            exportBtn.disabled = count < 2;
        }
    }

    // Create Add Column
    function createAddColumn() {
        const column = document.createElement('div');
        column.className = 'comparison-column add-column';
        column.innerHTML = `
            <div class="add-column-content">
                <i class="fas fa-plus-circle"></i>
                <span>Add Crane</span>
                <small>Click or drag here</small>
            </div>
        `;
        return column;
    }

    // Add Crane to Comparison Table
    function addCraneToComparison(crane) {
        const comparisonTable = document.getElementById('comparisonTable');
        const emptyComparison = document.getElementById('emptyComparison');
        
        // Hide empty state if visible
        if (emptyComparison) {
            emptyComparison.style.display = 'none';
        }
        
        // Show table if hidden
        if (comparisonTable) {
            comparisonTable.style.display = 'flex';
            
            // Create new column
            const column = document.createElement('div');
            column.className = 'comparison-column';
            column.dataset.craneId = crane._id;
            column.innerHTML = `
                <div class="column-header">
                    <button class="remove-btn" data-crane-id="${crane._id}">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="crane-image">
                        <img src="${crane.image || '/images/default-crane.jpg'}" 
                            alt="${crane.model || 'Crane'}">
                        <span class="crane-type-badge">${crane.type || 'Unknown Type'}</span>
                    </div>
                    <h4 class="crane-model">${crane.model || 'Unknown Model'}</h4>
                    <p class="crane-manufacturer">
                        <i class="fas fa-industry"></i>
                        ${crane.manufacturer || 'Unknown Manufacturer'}
                    </p>
                </div>
                
                <div class="column-specs">
                    <div class="spec-row">
                        <span class="spec-label">Max Load Capacity</span>
                        <span class="spec-value">
                            <i class="fas fa-weight-hanging"></i>
                            ${crane.max_load_capacity || 'N/A'}
                        </span>
                    </div>
                    <div class="spec-row">
                        <span class="spec-label">Boom Length</span>
                        <span class="spec-value">
                            <i class="fas fa-ruler-vertical"></i>
                            ${crane.boom_length || 'N/A'}
                        </span>
                    </div>
                    ${crane.price_range ? `
                    <div class="spec-row">
                        <span class="spec-label">Price Range</span>
                        <span class="spec-value">
                            <i class="fas fa-dollar-sign"></i>
                            ${crane.price_range}
                        </span>
                    </div>
                    ` : ''}
                    ${crane.specs && crane.specs.reach_m ? `
                    <div class="spec-row">
                        <span class="spec-label">Reach</span>
                        <span class="spec-value">
                            <i class="fas fa-arrows-alt-h"></i>
                            ${crane.specs.reach_m} m
                        </span>
                    </div>
                    ` : ''}
                    ${crane.specs && crane.specs.weight_t ? `
                    <div class="spec-row">
                        <span class="spec-label">Weight</span>
                        <span class="spec-value">
                            <i class="fas fa-weight"></i>
                            ${crane.specs.weight_t} t
                        </span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="column-actions">
                    ${crane.ar_link ? `
                        <button class="btn btn-sm btn-outline ar-btn" data-ar-model="${crane.ar_link}">
                            <i class="fas fa-vr-cardboard"></i>
                            View in AR
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-primary contact-btn" data-crane-id="${crane._id}">
                        <i class="fas fa-envelope"></i>
                        Contact Owner
                    </button>
                    <a href="/cranes/${crane._id}" class="btn btn-sm btn-secondary">
                        <i class="fas fa-info-circle"></i>
                        Details
                    </a>
                </div>
            `;
            
            // Insert before add column or at the end
            const addColumn = document.querySelector('.add-column');
            if (addColumn) {
                comparisonTable.insertBefore(column, addColumn);
            } else {
                comparisonTable.appendChild(column);
            }
            
            // Show actions
            const comparisonActions = document.getElementById('comparisonActions');
            if (comparisonActions) {
                comparisonActions.style.display = 'flex';
            }
        }
        
        updateComparisonUI();
    }

    // ========================================================================
    // SECOND COMPARISON TABLE (Actual table layout)
    // ========================================================================
    window.addCraneToComparisonTable = function(crane) {
        let table = document.getElementById('actualComparisonTable');
        if (!table) {
            table = document.createElement('table');
            table.id = 'actualComparisonTable';
            table.classList = 'actual-compare-table';
            table.innerHTML = `
                <thead>
                    <tr id="headerRow">
                        <th>Feature</th>
                    </tr>
                </thead>
                <tbody>
                    <tr id="typeRow"><td>Type</td></tr>
                    <tr id="manufacturerRow"><td>Manufacturer</td></tr>
                    <tr id="modelRow"><td>Model</td></tr>
                    <tr id="capacityRow"><td>Max Load Capacity</td></tr>
                    <tr id="boomRow"><td>Boom Length</td></tr>
                    <tr id="priceRow"><td>Price Range</td></tr>
                    <tr id="applicationsRow"><td>Applications</td></tr>
                    <tr id="imageRow"><td>Image</td></tr>
                    <tr id="arRow"><td>AR Model</td></tr>
                </tbody>
            `;
            document.querySelector('#compare').appendChild(table);
        }

        // Add column header
        const headerRow = document.getElementById('headerRow');
        const th = document.createElement('th');
        th.textContent = crane.model || "Unknown Model";
        headerRow.appendChild(th);

        // Add each feature
        appendCell('typeRow', crane.type);
        appendCell('manufacturerRow', crane.manufacturer);
        appendCell('modelRow', crane.model);
        appendCell('capacityRow', crane.max_load_capacity);
        appendCell('boomRow', crane.boom_length);
        appendCell('priceRow', crane.price_range || 'N/A');
        appendCell('applicationsRow', crane.applications || 'N/A');

        // Image cell
        const imgCell = document.createElement('td');
        imgCell.innerHTML = `<img src="${crane.image}" class="actual-table-img" />`;
        document.getElementById('imageRow').appendChild(imgCell);

        // AR Model
        const arCell = document.createElement('td');
        arCell.innerHTML = crane.ar_link 
            ? `<a href="${crane.ar_link}" target="_blank">View AR</a>`
            : 'N/A';
        document.getElementById('arRow').appendChild(arCell);


        function appendCell(rowId, value) {
            const td = document.createElement('td');
            td.textContent = value || 'N/A';
            document.getElementById(rowId).appendChild(td);
        }
    };


    // 🔹 Make addCraneToComparison globally accessible
    window.addCraneToComparison = addCraneToComparison;

    // Initialize if there are existing cranes
    updateComparisonUI();
}

/**
 * Initialize Load Analysis
 */
function initLoadAnalysis() {
    const analysisForm = document.getElementById('loadAnalysisForm');
    const resultsContent = document.getElementById('resultsContent');
    const warningsContainer = document.getElementById('warningsContainer');
    const warningList = document.getElementById('warningList');
    const loadDiagram = document.getElementById('loadDiagram');
    const toggleDiagramBtn = document.getElementById('toggleDiagram');

    // Form Submission
    analysisForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Validate inputs
        if (!validateAnalysisInputs(data)) {
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        submitBtn.disabled = true;
        
        try {
            // Send analysis request
            const response = await fetch('/load-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Display results
                displayAnalysisResults(result);
                
                // Update diagram
                updateLoadDiagram(data, result);
                
                // Show warnings if any
                if (result.warnings && result.warnings.length > 0) {
                    displayWarnings(result.warnings);
                } else {
                    warningsContainer.style.display = 'none';
                }
                
                showFlashMessage('Analysis completed successfully', 'success');
            } else {
                showFlashMessage(result.error || 'Analysis failed', 'error');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            showFlashMessage('Error performing analysis', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Form Reset
    analysisForm.addEventListener('reset', function() {
        resetAnalysisResults();
        warningsContainer.style.display = 'none';
        loadDiagram.style.height = '200px';
    });

    // Toggle Diagram
    if (toggleDiagramBtn) {
        toggleDiagramBtn.addEventListener('click', function() {
            if (loadDiagram.style.height === '400px') {
                loadDiagram.style.height = '200px';
                this.innerHTML = '<i class="fas fa-expand"></i> Expand';
            } else {
                loadDiagram.style.height = '400px';
                this.innerHTML = '<i class="fas fa-compress"></i> Collapse';
            }
        });
    }

    // Validate Analysis Inputs
    function validateAnalysisInputs(data) {
        const errors = [];
        
        if (!data.loadWeight || parseFloat(data.loadWeight) <= 0) {
            errors.push('Load weight must be greater than 0');
        }
        
        if (!data.boomLength || parseFloat(data.boomLength) <= 0) {
            errors.push('Boom length must be greater than 0');
        }
        
        if (!data.workingRadius || parseFloat(data.workingRadius) <= 0) {
            errors.push('Working radius must be greater than 0');
        }
        
        if (parseFloat(data.workingRadius) > parseFloat(data.boomLength)) {
            errors.push('Working radius cannot exceed boom length');
        }
        
        if (!data.terrainType) {
            errors.push('Please select terrain type');
        }
        
        if (!data.windCondition) {
            errors.push('Please select wind condition');
        }
        
        if (errors.length > 0) {
            showFlashMessage(errors.join('<br>'), 'error');
            return false;
        }
        
        return true;
    }

    // Display Analysis Results
    function displayAnalysisResults(result) {
        const resultsHTML = `
            <div class="analysis-results-grid">
                <div class="result-item ${result.counterweight?.status || ''}">
                    <div class="result-icon">
                        <i class="fas fa-balance-scale-right"></i>
                    </div>
                    <div class="result-info">
                        <h4>Recommended Counterweight</h4>
                        <div class="result-value">${result.counterweight?.value || '--'} tons</div>
                        <div class="result-note">${result.counterweight?.note || ''}</div>
                    </div>
                </div>
                
                <div class="result-item ${result.groundPressure?.status || ''}">
                    <div class="result-icon">
                        <i class="fas fa-tachometer-alt"></i>
                    </div>
                    <div class="result-info">
                        <h4>Ground Pressure</h4>
                        <div class="result-value">${result.groundPressure?.value || '--'} kPa</div>
                        <div class="result-note">${result.groundPressure?.note || ''}</div>
                    </div>
                </div>
                
                <div class="result-item ${result.padSize?.status || ''}">
                    <div class="result-icon">
                        <i class="fas fa-square"></i>
                    </div>
                    <div class="result-info">
                        <h4>Minimum Pad Size</h4>
                        <div class="result-value">${result.padSize?.value || '--'} m²</div>
                        <div class="result-note">${result.padSize?.note || ''}</div>
                    </div>
                </div>
                
                <div class="result-item ${result.safetyFactor?.status || ''}">
                    <div class="result-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="result-info">
                        <h4>Safety Factor</h4>
                        <div class="result-value">${result.safetyFactor?.value || '--'}</div>
                        <div class="result-note">${result.safetyFactor?.note || ''}</div>
                    </div>
                </div>
            </div>
        `;
        
        resultsContent.innerHTML = resultsHTML;
        
        // Update status
        document.getElementById('resultsStatus').textContent = 'Analysis Complete';
        document.getElementById('resultsStatus').style.background = '#2ECC71';
        document.getElementById('resultsStatus').style.color = 'white';
    }

    // Display Warnings
    function displayWarnings(warnings) {
        warningList.innerHTML = '';
        
        warnings.forEach(warning => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${warning}`;
            warningList.appendChild(li);
        });
        
        warningsContainer.style.display = 'block';
    }

    // Update Load Diagram
    function updateLoadDiagram(inputs, results) {
        const craneDiagram = loadDiagram.querySelector('.crane-diagram');
        
        if (!craneDiagram) return;
        
        // Calculate visual proportions
        const boomAngle = Math.asin(inputs.workingRadius / inputs.boomLength) * (180 / Math.PI);
        const boomLengthPercent = Math.min(parseFloat(inputs.boomLength) / 100, 0.8);
        const loadWeightPercent = Math.min(parseFloat(inputs.loadWeight) / 50, 0.3);
        
        // Update boom
        const boom = craneDiagram.querySelector('.boom-diagram');
        if (boom) {
            boom.style.transform = `rotate(${boomAngle}deg)`;
            boom.style.width = `${boomLengthPercent * 100}%`;
        }
        
        // Update load
        const load = craneDiagram.querySelector('.load-diagram');
        if (load) {
            load.style.left = `${70 + (boomAngle / 90) * 10}%`;
            load.style.height = `${loadWeightPercent * 100}px`;
            load.style.background = inputs.windCondition === 'severe' ? '#FF6B6B' : 
                                   inputs.windCondition === 'strong' ? '#FFA726' : '#4CAF50';
        }
        
        // Update counterweight
        const counterweight = craneDiagram.querySelector('.counterweight-diagram');
        if (counterweight && results.counterweight) {
            const counterweightPercent = Math.min(parseFloat(results.counterweight.value) / 100, 0.4);
            counterweight.style.height = `${counterweightPercent * 100}px`;
            counterweight.style.background = results.safetyFactor?.status === 'danger' ? '#FF4757' :
                                           results.safetyFactor?.status === 'warning' ? '#FFA500' : '#2ECC71';
        }
    }

    // Reset Analysis Results
    function resetAnalysisResults() {
        resultsContent.innerHTML = `
            <div class="placeholder-results">
                <div class="result-item">
                    <div class="result-icon">
                        <i class="fas fa-balance-scale-right"></i>
                    </div>
                    <div class="result-info">
                        <h4>Recommended Counterweight</h4>
                        <div class="result-value">-- tons</div>
                    </div>
                </div>
                
                <div class="result-item">
                    <div class="result-icon">
                        <i class="fas fa-tachometer-alt"></i>
                    </div>
                    <div class="result-info">
                        <h4>Ground Pressure</h4>
                        <div class="result-value">-- kPa</div>
                    </div>
                </div>
                
                <div class="result-item">
                    <div class="result-icon">
                        <i class="fas fa-square"></i>
                    </div>
                    <div class="result-info">
                        <h4>Minimum Pad Size</h4>
                        <div class="result-value">-- m²</div>
                    </div>
                </div>
                
                <div class="result-item">
                    <div class="result-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="result-info">
                        <h4>Safety Factor</h4>
                        <div class="result-value">--</div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('resultsStatus').textContent = 'Enter parameters and click "Calculate"';
        document.getElementById('resultsStatus').style.background = '';
        document.getElementById('resultsStatus').style.color = '';
        
        // Reset diagram
        const boom = loadDiagram.querySelector('.boom-diagram');
        const load = loadDiagram.querySelector('.load-diagram');
        const counterweight = loadDiagram.querySelector('.counterweight-diagram');
        
        if (boom) boom.style.transform = 'rotate(30deg)';
        if (boom) boom.style.width = '40%';
        if (load) load.style.height = '10%';
        if (load) load.style.background = '#FF4757';
        if (counterweight) counterweight.style.height = '15%';
        if (counterweight) counterweight.style.background = '#2ECC71';
    }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Add to comparison from recent cranes
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.add-to-comparison-btn')) {
            const btn = e.target.closest('.add-to-comparison-btn');
            const craneId = btn.dataset.craneId;
            
            try {
                const response = await fetch('/compare/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ craneId })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    showFlashMessage('Crane added to comparison', 'success');
                    
                    // Add to comparison table
                    const comparisonTable = document.getElementById('comparisonTable');
                    if (comparisonTable && typeof window.addCraneToComparison === 'function') {
                        window.addCraneToComparison(result.crane);
                    }
                }
            } catch (error) {
                console.error('Error adding crane:', error);
                showFlashMessage('Error adding crane to comparison', 'error');
            }
        }
    });

    // Favorite button
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.favorite-btn')) {
            const btn = e.target.closest('.favorite-btn');
            const craneId = btn.dataset.craneId;
            const icon = btn.querySelector('i');
            const isFavorite = icon.classList.contains('fas');
            
            try {
                const response = await fetch(`/favorites/${isFavorite ? 'remove' : 'add'}/${craneId}`, {
                    method: 'POST'
                });
                
                if (response.ok) {
                    if (isFavorite) {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        showFlashMessage('Removed from favorites', 'info');
                    } else {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        showFlashMessage('Added to favorites', 'success');
                    }
                }
            } catch (error) {
                console.error('Error toggling favorite:', error);
                showFlashMessage('Error updating favorites', 'error');
            }
        }
    });
}

/**
 * Helper Functions
 */
function showFlashMessage(message, type = 'info') {
    // Create flash message element
    const flashDiv = document.createElement('div');
    flashDiv.className = `flash-message flash-${type}`;
    flashDiv.innerHTML = `
        <span>${message}</span>
        <button class="flash-close">&times;</button>
    `;
    
    // Add to page
    const container = document.querySelector('.flash-messages') || document.body;
    container.appendChild(flashDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        flashDiv.remove();
    }, 5000);
    
    // Add click to close
    const closeBtn = flashDiv.querySelector('.flash-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => flashDiv.remove());
    }
}

// Export functions for global use
window.closeModal = function() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
    
    const modalStyle = document.querySelector('style[data-modal-style]');
    if (modalStyle) modalStyle.remove();
};

window.sendContactRequest = async function(craneId) {
    const subject = document.getElementById('contactSubject')?.value;
    const message = document.getElementById('contactMessage')?.value;
    
    if (!subject || !message) {
        showFlashMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch('/contact/owner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                craneId,
                subject,
                message
            })
        });
        
        if (response.ok) {
            closeModal();
            showFlashMessage('Inquiry sent successfully', 'success');
        } else {
            showFlashMessage('Error sending inquiry', 'error');
        }
    } catch (error) {
        console.error('Error sending contact request:', error);
        showFlashMessage('Error sending inquiry', 'error');
    }
};

window.exportAsPDF = function() {
    showFlashMessage('PDF export feature coming soon', 'info');
};

window.exportAsExcel = function() {
    showFlashMessage('Excel export feature coming soon', 'info');
};

window.exportAsCSV = function() {
    showFlashMessage('CSV export feature coming soon', 'info');
};
