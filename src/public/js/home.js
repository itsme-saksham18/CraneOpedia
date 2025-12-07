

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
        
        if (!modelId) {
            addButton.disabled = true;
            selectedPreview.style.display = 'none';
            return;
        }

        try {
            // Fetch crane details (READ ONLY, no session)
            const response = await fetch(`/cranes/${modelId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
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
            option.value = model._id;
            
            let displayText = model.model || 'Unknown Model';
            if (model.max_load_capacity) {
                displayText += ` - ${model.max_load_capacity}`;
            }
            if (model.boom_length) {
                displayText += ` (${model.boom_length} boom)`;
            }
            option.textContent = displayText;
            
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
    addButton.addEventListener('click', function() {
        if (!selectedCrane) return;
        console.log('Add to Comparison clicked');

        // Check if crane is already in comparison (card layout)
        const existingCrane = document.querySelector(`.comparison-column[data-crane-id="${selectedCrane._id}"]`);
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

        // FRONTEND ONLY: Update both comparison UIs
        if (typeof window.addCraneToComparison === 'function') {
            window.addCraneToComparison(selectedCrane);
        }
        if (typeof window.addCraneToComparisonTable === 'function') {
            window.addCraneToComparisonTable(selectedCrane);
        }
        showFlashMessage('Crane added to comparison', 'success');
        clearSelection();
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

    // Remove Crane from Comparison (FRONTEND ONLY)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-btn')) {
            const removeBtn = e.target.closest('.remove-btn');
            const craneId = removeBtn.dataset.craneId;
            
            // Remove from card-based comparison
            const column = removeBtn.closest('.comparison-column');
            if (column) {
                column.style.animation = 'slideIn 0.3s ease reverse forwards';
                setTimeout(() => {
                    column.remove();
                    updateComparisonUI();
                }, 300);
            }

            // Remove from actual comparison table
            const actualTable = document.getElementById('actualComparisonTable');
            if (actualTable) {
                const cells = actualTable.querySelectorAll(`[data-crane-id="${craneId}"]`);
                cells.forEach(cell => cell.remove());

                // If only "Feature" column left, remove the whole table
                const headerRow = actualTable.querySelector('#headerRow');
                if (headerRow && headerRow.children.length <= 1) {
                    actualTable.remove();
                }
            }

            showFlashMessage('Crane removed from comparison', 'info');
        }
    });

    // Add Column Click
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-column')) {
            document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
            
            const searchCard = document.querySelector('.search-card');
            if (searchCard) {
                searchCard.style.animation = 'highlight 1s ease';
                setTimeout(() => {
                    searchCard.style.animation = '';
                }, 1000);
            }
        }
    });

    // Start Comparison Button
    if (startComparisonBtn) {
        startComparisonBtn.addEventListener('click', function() {
            document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Export Comparison (still placeholder)
    document.getElementById('exportComparison')?.addEventListener('click', function() {
        exportComparison();
    });

    // Clear All Comparison (FRONTEND ONLY)
    document.getElementById('clearComparison')?.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all cranes from comparison?')) {
            // Clear card columns
            const columns = document.querySelectorAll('.comparison-column:not(.add-column)');
            columns.forEach(column => {
                column.style.animation = 'slideIn 0.3s ease reverse forwards';
                setTimeout(() => column.remove(), 300);
            });

            // Remove actual comparison table
            const actualTable = document.getElementById('actualComparisonTable');
            if (actualTable) {
                actualTable.remove();
            }

            updateComparisonUI();
            showFlashMessage('Comparison cleared', 'info');
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
        
        // Update count badge
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
        
        // Enable/disable export
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

    // Add Crane to Card Layout Comparison Table
    function addCraneToComparison(crane) {
        const comparisonTable = document.getElementById('comparisonTable');
        const emptyComparison = document.getElementById('emptyComparison');
        
        if (emptyComparison) {
            emptyComparison.style.display = 'none';
        }
        
        if (comparisonTable) {
            comparisonTable.style.display = 'flex';
            
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
            
            const addColumn = document.querySelector('.add-column');
            if (addColumn) {
                comparisonTable.insertBefore(column, addColumn);
            } else {
                comparisonTable.appendChild(column);
            }
            
            if (comparisonActions) {
                comparisonActions.style.display = 'flex';
            }
        }
        
        updateComparisonUI();
    }

    // ========================================================================
    // SECOND COMPARISON TABLE (Actual table layout, PURE FRONTEND)
    // ========================================================================
    window.addCraneToComparisonTable = function(crane) {
        let container = document.getElementById('compare');
        if (!container) {
            container = document.createElement('div');
            container.id = 'compare';
            container.style.marginTop = '2rem';
            const comparisonSection = document.getElementById('comparison-section');
            if (comparisonSection) {
                comparisonSection.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
        }

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
            container.appendChild(table);
        }

        // Add header cell
        const headerRow = document.getElementById('headerRow');
        const th = document.createElement('th');
        th.textContent = crane.model || "Unknown Model";
        th.dataset.craneId = crane._id;
        headerRow.appendChild(th);

        // Add each feature cell
        appendCell('typeRow', crane.type, crane._id);
        appendCell('manufacturerRow', crane.manufacturer, crane._id);
        appendCell('modelRow', crane.model, crane._id);
        appendCell('capacityRow', crane.max_load_capacity, crane._id);
        appendCell('boomRow', crane.boom_length, crane._id);
        appendCell('priceRow', crane.price_range || 'N/A', crane._id);
        appendCell('applicationsRow', crane.applications || 'N/A', crane._id);

        // Image cell
        const imgCell = document.createElement('td');
        imgCell.dataset.craneId = crane._id;
        imgCell.innerHTML = `<img src="${crane.image || '/images/default-crane.jpg'}" class="actual-table-img" />`;
        document.getElementById('imageRow').appendChild(imgCell);

        // AR Model cell
        const arCell = document.createElement('td');
        arCell.dataset.craneId = crane._id;
        arCell.innerHTML = crane.ar_link 
            ? `<a href="${crane.ar_link}" target="_blank">View AR</a>`
            : 'N/A';
        document.getElementById('arRow').appendChild(arCell);

        function appendCell(rowId, value, craneId) {
            const td = document.createElement('td');
            td.textContent = value || 'N/A';
            td.dataset.craneId = craneId;
            document.getElementById(rowId).appendChild(td);
        }
    };

    // Make card comparison function global
    window.addCraneToComparison = addCraneToComparison;

    // Initialize UI state if any pre-rendered cranes exist
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
    const modelSelect = document.getElementById('craneModelSelect');

    // Map short option values (if you accidentally used them) to backend labels.
    function mapWindValue(val) {
        if (!val) return '';
        val = String(val).toLowerCase();
        if (val.includes('calm') || val === 'calm') return 'Calm (0-20 km/h)';
        if (val.includes('moderate') || val === 'moderate') return 'Moderate (21-40 km/h)';
        if (val.includes('strong') || val === 'strong') return 'Strong (41-60 km/h)';
        if (val.includes('severe') || val === 'severe') return 'Severe (61+ km/h)';
        return val; // assume already backend label
    }

    function mapTerrainValue(val) {
        if (!val) return '';
        val = String(val).toLowerCase();
        if (val.includes('concrete') || val === 'concrete' || val === 'concrete/asphalt') return 'Concrete/Asphalt';
        if (val.includes('compact') || val === 'compact_soil') return 'Compact Soil';
        if (val.includes('loose') || val === 'loose_soil') return 'Loose Soil';
        if (val.includes('gravel')) return 'Gravel';
        if (val.includes('sand')) return 'Sand';
        if (val.includes('unstable')) return 'Unstable Ground';
        return val; 
    }
    // Form Submission
    analysisForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Remap terrain & wind to backend-friendly labels (backwards compatible)
        data.terrainType = mapTerrainValue(data.terrainType);
        data.windCondition = mapWindValue(data.windCondition);

        // Validate inputs
        if (!validateAnalysisInputs(data)) {
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/load-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                displayAnalysisResults(result);
                updateLoadDiagram(data, result);

                if (result.warnings && result.warnings.length > 0) {
                    displayWarnings(result.warnings);
                } else {
                    warningsContainer.style.display = 'none';
                }

                showFlashMessage('Analysis completed successfully', 'success');
            } else {
                // If backend returns structured validation errors
                const msg = result.error || (result.details ? result.details.join('<br>') : 'Analysis failed');
                showFlashMessage(msg, 'error');
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
        if (loadDiagram) loadDiagram.style.height = '200px';
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

    // Validate Analysis Inputs (unchanged but safe)
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

function displayAnalysisResults(result) {
    const cwVal = result.counterweight?.value ?? result.counterweight?.value_t ?? '--';
    const cwNote = result.counterweight?.note ?? '';
    const cwStatus = result.counterweight?.status ?? '';
    const gpVal = result.ground?.outriggerPressure_kPa ?? '--';
    const gpNote = `Soil capacity: ${result.ground?.soilCapacity_kPa ?? '--'} kPa`;
    const gpStatus = gpVal > (result.ground?.soilCapacity_kPa ?? 9999) ? 'danger' : 'warning';
    const padVal = result.ground?.requiredPadArea_m2 ?? '--';
    const padNote = `Recommended pad area to stay within soil limits.`;
    const padStatus = padVal > 10 ? 'warning' : '';
    const sfVal = result.stability?.computedSafetyFactor ?? '--';
    const sfNote = `Overturning ratio: ${result.stability?.overturningRatio ?? '--'}`;
    const sfStatus = sfVal < 1.2 ? 'danger' : (sfVal < 1.5 ? 'warning' : '');

    // --- Render updated UI ---
    const resultsHTML = `
        <div class="analysis-results-grid">

            <div class="result-item ${cwStatus}">
                <div class="result-icon"><i class="fas fa-balance-scale-right"></i></div>
                <div class="result-info">
                    <h4>Recommended Counterweight</h4>
                    <div class="result-value">${cwVal} tons</div>
                    <div class="result-note">${cwNote}</div>
                </div>
            </div>

            <div class="result-item ${gpStatus}">
                <div class="result-icon"><i class="fas fa-tachometer-alt"></i></div>
                <div class="result-info">
                    <h4>Ground Pressure</h4>
                    <div class="result-value">${gpVal} kPa</div>
                    <div class="result-note">${gpNote}</div>
                </div>
            </div>

            <div class="result-item ${padStatus}">
                <div class="result-icon"><i class="fas fa-square"></i></div>
                <div class="result-info">
                    <h4>Minimum Pad Size</h4>
                    <div class="result-value">${padVal} m²</div>
                    <div class="result-note">${padNote}</div>
                </div>
            </div>

            <div class="result-item ${sfStatus}">
                <div class="result-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="result-info">
                    <h4>Safety Factor</h4>
                    <div class="result-value">${sfVal}</div>
                    <div class="result-note">${sfNote}</div>
                </div>
            </div>

        </div>
    `;

    resultsContent.innerHTML = resultsHTML;

    const status = document.getElementById('resultsStatus');
    status.textContent = 'Analysis Complete';
    status.style.background = '#2ECC71';
    status.style.color = 'white';
}

    // Display Warnings — handle both strings and objects [{code,severity,message}]
    function displayWarnings(warnings) {
        warningList.innerHTML = '';

        warnings.forEach(w => {
            let severity = 'warning';
            let message = '';

            if (typeof w === 'string') {
                message = w;
            } else if (typeof w === 'object' && w !== null) {
                message = w.message || JSON.stringify(w);
                severity = w.severity || (w.code && w.code.includes('danger') ? 'danger' : 'warning');
            } else {
                message = String(w);
            }

            const li = document.createElement('div');
            li.className = `warning-item warning-${severity}`;
            li.innerHTML = `
                <div class="warning-badge ${severity}">${severity === 'danger' ? 'DANGER' : 'WARNING'}</div>
                <div class="warning-text">${message}</div>
            `;
            warningList.appendChild(li);
        });

        warningsContainer.style.display = 'block';
    }

    // Update Load Diagram — robust to different result shapes
    function updateLoadDiagram(inputs, results) {
        if (!loadDiagram) return;
        const craneDiagram = loadDiagram.querySelector('.crane-diagram');
        if (!craneDiagram) return;

        // Determine boom angle from result (preferred) or compute from inputs
        let boomAngle = null;
        if (results.diagram && results.diagram.boomAngle !== undefined) {
            boomAngle = Number(results.diagram.boomAngle);
        } else if (results.physics && results.physics.boomAngleDeg !== undefined) {
            boomAngle = Number(results.physics.boomAngleDeg);
        } else {
            // safe compute: asin(radius/boom)
            const r = Number(inputs.workingRadius);
            const b = Number(inputs.boomLength);
            if (b && r && r < b) {
                boomAngle = Math.asin(r / b) * (180 / Math.PI);
            } else {
                boomAngle = 30;
            }
        }

        const boomLengthPercent = Math.min(parseFloat(inputs.boomLength) / 100, 0.8);
        const loadWeightPercent = Math.min(parseFloat(inputs.loadWeight) / 50, 0.3);

        const boom = craneDiagram.querySelector('.boom-diagram');
        if (boom) {
            boom.style.transform = `rotate(${boomAngle}deg)`;
            boom.style.width = `${boomLengthPercent * 100}%`;
        }

        const load = craneDiagram.querySelector('.load-diagram');
        if (load) {
            load.style.left = `${70 + (boomAngle / 90) * 10}%`;
            load.style.height = `${loadWeightPercent * 100}px`;
            // determine wind: try to use normalized value
            const windKey = mapWindValue(inputs.windCondition).toLowerCase();
            load.style.background = windKey.includes('severe') ? '#FF6B6B' :
                                   windKey.includes('strong') ? '#FFA726' : '#4CAF50';
        }

        const counterweight = craneDiagram.querySelector('.counterweight-diagram');
        if (counterweight && results.counterweight) {
            const cwVal = results.counterweight.value ?? results.counterweight.value_t ?? 0;
            const counterweightPercent = Math.min(parseFloat(cwVal) / 100, 0.4);
            counterweight.style.height = `${counterweightPercent * 100}px`;

            const sfStatus = (results.safetyFactor && (results.safetyFactor.status || results.safetyFactor)) || '';
            counterweight.style.background = sfStatus === 'danger' ? '#FF4757' :
                                             sfStatus === 'warning' ? '#FFA500' : '#2ECC71';
        }
    }

    // Reset Analysis Results 
    function resetAnalysisResults() {
        resultsContent.innerHTML = `
            <div class="placeholder-results">
                <div class="result-item">
                    <div class="result-icon"><i class="fas fa-balance-scale-right"></i></div>
                    <div class="result-info"><h4>Recommended Counterweight</h4><div class="result-value">-- tons</div></div>
                </div>
                <div class="result-item">
                    <div class="result-icon"><i class="fas fa-tachometer-alt"></i></div>
                    <div class="result-info"><h4>Ground Pressure</h4><div class="result-value">-- kPa</div></div>
                </div>
                <div class="result-item">
                    <div class="result-icon"><i class="fas fa-square"></i></div>
                    <div class="result-info"><h4>Minimum Pad Size</h4><div class="result-value">-- m²</div></div>
                </div>
                <div class="result-item">
                    <div class="result-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="result-info"><h4>Safety Factor</h4><div class="result-value">--</div></div>
                </div>
            </div>
        `;

        const status = document.getElementById('resultsStatus');
        if (status) {
            status.textContent = 'Enter parameters and click "Calculate"';
            status.style.background = '';
            status.style.color = '';
        }

        const boom = loadDiagram?.querySelector('.boom-diagram');
        const load = loadDiagram?.querySelector('.load-diagram');
        const counterweight = loadDiagram?.querySelector('.counterweight-diagram');

        if (boom) { boom.style.transform = 'rotate(30deg)'; boom.style.width = '40%'; }
        if (load) { load.style.height = '10%'; load.style.background = '#FF4757'; }
        if (counterweight) { counterweight.style.height = '15%'; counterweight.style.background = '#2ECC71'; }
    }
}

/**
 * Setup Event Listeners (recent cranes, favorites)
 */
function setupEventListeners() {
    // Add to comparison from "Popular & Recent" cards
    document.addEventListener('click', async function(e) {
        const btn = e.target.closest('.add-to-comparison-btn');
        if (!btn) return;

        const craneId = btn.dataset.craneId;
        console.log('Adding crane to comparison:', craneId);

        if (!craneId) {
            showFlashMessage('Invalid crane id', 'error');
            return;
        }

        try {
            // === Check duplicates only inside comparison columns (avoid matching the button itself) ===
            const existingCraneInComparison = document.querySelector(`.comparison-column[data-crane-id="${craneId}"]`);
            if (existingCraneInComparison) {
                showFlashMessage('This crane is already in comparison', 'warning');
                return;
            }

            // Limit check
            const comparisonCount = document.querySelectorAll('.comparison-column:not(.add-column)').length;
            if (comparisonCount >= 5) {
                showFlashMessage('Maximum 5 cranes allowed in comparison', 'error');
                return;
            }

            // Fetch crane info (robust handling if server returns HTML instead of JSON)
            const response = await fetch(`/cranes/${craneId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            // Check content-type before parsing
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                // Helpful debug info
                const text = await response.text();
                console.error('Expected JSON but received:', text.slice(0, 400));
                showFlashMessage('Server returned HTML instead of JSON for crane details. Check /cranes/:id JSON route.', 'error');
                return;
            }

            const data = await response.json();
            const crane = data.crane || data; // allow either {crane:...} or direct object

            if (!crane) {
                showFlashMessage('Crane not found', 'error');
                return;
            }

            // Add to BOTH comparison tables — exactly once each
            if (typeof window.addCraneToComparison === 'function') {
                window.addCraneToComparison(crane);
                  // CARD VIEW
            } else {
                console.warn('addCraneToComparison not defined');
            }

            if (typeof window.addCraneToComparisonTable === 'function') {
                window.addCraneToComparisonTable(crane); // DETAILED TABLE
            } else {
                console.warn('addCraneToComparisonTable not defined');
            }

            // Smooth scroll to comparison section
            scrollToComparison();
            showFlashMessage('Crane added to comparison', 'success');

        } catch (error) {
            console.error('Error adding crane:', error);
            // If JSON parse failed or other error, surface clearer message
            if (String(error).includes('Unexpected token') || String(error).includes('JSON')) {
                showFlashMessage('Invalid server response (expected JSON). Check /cranes/:id route.', 'error');
            } else {
                showFlashMessage('Error adding crane to comparison', 'error');
            }
        }
    });

    // Favorite button (still backend)
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
    const flashDiv = document.createElement('div');
    flashDiv.className = `flash-message flash-${type}`;
    flashDiv.innerHTML = `
        <span>${message}</span>
        <button class="flash-close">&times;</button>
    `;
    
    const container = document.querySelector('.flash-messages') || document.body;
    container.appendChild(flashDiv);
    
    setTimeout(() => {
        flashDiv.remove();
    }, 5000);
    
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

function scrollToComparison() {
    const section = document.getElementById("comparison-section");
    if (!section) return;

    section.scrollIntoView({ behavior: "smooth", block: "start" });

    section.classList.add('highlight-comparison');

    setTimeout(() => {
        section.classList.remove('highlight-comparison');
    }, 1200);
}


/* AR viewer helpers (paste into your home.js) */
(function() {
  const arModal = document.getElementById('arModal');
  const arBackdrop = document.getElementById('arModalBackdrop');
  const arClose = document.getElementById('arModalClose');
  const mvViewer = document.getElementById('mvViewer');
  const qrContainer = document.getElementById('qrContainer');
  const arModelPathEl = document.getElementById('arModelPath');
  const arNote = document.getElementById('arNote');
  const openARBtn = document.getElementById('openARBtn');
  const directModelLink = document.getElementById('directModelLink');
  const preview3DBtn = document.getElementById('preview3DBtn');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const downloadModelBtn = document.getElementById('downloadModelBtn');

  let currentModelUrl = null;
  let currentArPageUrl = null;
  let qrInstance = null;

  /* -------------------------------
       NORMALIZE MODEL PATHS
  -------------------------------- */
  function normalizeModelUrl(path) {
    if (!path) return null;
    path = String(path).trim();
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith('/')) return `${location.origin}${path}`;
    return `${location.origin}/${path}`;
  }

  /* -------------------------------
       GENERATE SHAREABLE AR LINK
  -------------------------------- */
  function buildArPageUrl(modelAbsoluteUrl) {
    const u = new URL('/ar-viewer', location.origin);
    u.searchParams.set('model', modelAbsoluteUrl);
    return u.toString();
  }

  /* -------------------------------
       QR GENERATION
  -------------------------------- */
  function clearQr() {
    qrContainer.innerHTML = '';
    qrInstance = null;
  }

  function generateQr(url) {
    clearQr();
    qrInstance = new QRCode(qrContainer, {
      text: url,
      width: 128,
      height: 128,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  /* -------------------------------
       SAFE MODAL SCROLL-LOCK FIX
  -------------------------------- */
    function openModal() {
        if (!arModal) return;
        arModal.style.display = 'flex';
    }


function closeModalFn() {
    if (!arModal) return;
    arModal.style.display = 'none';
    clearQr();
    if (mvViewer) mvViewer.removeAttribute('src');
}


  /* -------------------------------
       PUBLIC LAUNCH FUNCTION
  -------------------------------- */
  window.launchARViewer = function(arPathOrUrl) {
    const normalized = normalizeModelUrl(arPathOrUrl);
    if (!normalized) {
      showFlashMessage('Invalid AR model link.', 'error');
      return;
    }

    currentModelUrl = normalized;
    currentArPageUrl = buildArPageUrl(normalized);

    if (mvViewer) {
      mvViewer.src = normalized;
      mvViewer.setAttribute("src", normalized);
    }

    if (directModelLink) {
      directModelLink.href = normalized;
      directModelLink.style.display = 'inline-block';
    }

    if (arModelPathEl) arModelPathEl.textContent = normalized;

    const isUSDZ = normalized.toLowerCase().endsWith('.usdz');
    arNote.textContent = isUSDZ
      ? "USDZ detected — iPhone AR supported."
      : "Tip: For iPhone AR, upload a USDZ version.";

    generateQr(currentArPageUrl);
    openModal();

    if (!isMobileDevice()) {
      alert("Your device does not support AR. Please scan the QR code using your phone.");
      return;
    }

    setTimeout(() => {
      try {
        if (mvViewer?.activateAR) mvViewer.activateAR();
      } catch (err) {
        console.warn("Mobile AR activation error:", err);
      }
    }, 500);
  };

  /* -------------------------------
       DEVICE CHECK
  -------------------------------- */
  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  /* -------------------------------
       BUTTON EVENTS
  -------------------------------- */
  arClose?.addEventListener('click', closeModalFn);
  arBackdrop?.addEventListener('click', closeModalFn);

  openARBtn?.addEventListener('click', () => {
    if (!currentArPageUrl) return;
    window.open(currentArPageUrl, "_blank");
  });

  preview3DBtn?.addEventListener('click', () => {
    if (!mvViewer) return;
    mvViewer.removeAttribute("reveal");
    mvViewer.requestFullscreen?.();
  });

  copyLinkBtn?.addEventListener('click', () => {
    if (!currentArPageUrl) return;
    navigator.clipboard.writeText(currentArPageUrl)
      .then(() => showFlashMessage("Link copied!", "success"))
      .catch(() => showFlashMessage("Copy failed", "error"));
  });

  downloadModelBtn?.addEventListener('click', () => {
    if (!currentModelUrl) return;
    const a = document.createElement('a');
    a.href = currentModelUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  window.buildArPageUrl = buildArPageUrl;
})();
