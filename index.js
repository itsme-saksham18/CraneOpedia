document.getElementById('typeSelect').addEventListener('change', async function () {
    const type = this.value;
    const manufacturerSelect = document.getElementById('manufacturerSelect');
    const modelSelect = document.getElementById('modelSelect');
    
    // Show loading state
    manufacturerSelect.innerHTML = '<option>Loading...</option>';
    modelSelect.innerHTML = '<option>Select Model</option>';

    if (type) {
        try {
            const response = await fetch(`http://localhost:8080/getManufacturers?type=${encodeURIComponent(type)}`);
            ;
            if (!response.ok) throw new Error('Failed to fetch manufacturers');
            
            const manufacturers = await response.json();
            manufacturerSelect.innerHTML = '<option value="">Select Manufacturer</option>';
            manufacturers.forEach(manufacturer => {
                const option = document.createElement('option');
                option.value = manufacturer;
                option.textContent = manufacturer;
                manufacturerSelect.appendChild(option);
            });
        } catch (err) {
            console.error(err);
            manufacturerSelect.innerHTML = '<option>Error loading manufacturers</option>';
            alert('Failed to load manufacturers. Please try again.');
        }
    } else {
        manufacturerSelect.innerHTML = '<option>Select Manufacturer</option>';
    }
});

document.getElementById('manufacturerSelect').addEventListener('change', async function () {
    const manufacturer = this.value;
    const modelSelect = document.getElementById('modelSelect');
    
    // Show loading state
    modelSelect.innerHTML = '<option>Loading...</option>';

    if (manufacturer) {
        try {
            const response = await fetch(`http://localhost:8080/getModels?manufacturer=${encodeURIComponent(manufacturer)}`);;
            if (!response.ok) throw new Error('Failed to fetch models');
            
            const models = await response.json();
            modelSelect.innerHTML = '<option value="">Select Model</option>';
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
        } catch (err) {
            console.error(err);
            modelSelect.innerHTML = '<option>Error loading models</option>';
            alert('Failed to load models. Please try again.');
        }
    } else {
        modelSelect.innerHTML = '<option>Select Model</option>';
    }
});

let comparedCranes = [];

document.querySelector('.bg-yellow-500.text-white.px-4.py-2.rounded.font-bold').addEventListener('click', async function () {
    const model = document.getElementById('modelSelect').value;

    if (!model) {
        alert('Please select a model first!');
        return;
    }

    if (comparedCranes.includes(model)) {
        alert('This crane is already added for comparison.');
        return;
    }

    if (comparedCranes.length >= 5) {
        alert('You can compare up to 5 cranes only.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/getCraneDetails?model=${encodeURIComponent(model)}`);
        const crane = await response.json();

        if (crane.error) {
            alert(crane.error);
            return;
        }

        comparedCranes.push(model);
        addCraneToComparisonTable(crane);
    } catch (err) {
        console.error(err);
        alert('Failed to fetch crane details.');
    }
});

function viewARModel(arLink) {
    let modelViewer = document.createElement('model-viewer');
    modelViewer.src = arLink;
    modelViewer.setAttribute('ar', '');
    modelViewer.setAttribute('ar-modes', 'scene-viewer quick-look');
    modelViewer.setAttribute('camera-controls', '');
    modelViewer.style.display = 'none'; 
    document.body.appendChild(modelViewer);
    if (modelViewer.canActivateAR) {
        modelViewer.activateAR();
    } else {
        alert("AR mode not supported on this device.");
    }
}

function addCraneToComparisonTable(crane) {
    let table = document.getElementById('comparisonTable');
    if (!table) {
        table = document.createElement('table');
        table.id = 'comparisonTable';
        table.classList = 'table-auto w-full mt-6 border border-yellow-500 text-yellow-500';
        table.innerHTML = `
            <thead>
                <tr id="headerRow" class="border border-yellow-500 bg-yellow-100 text-yellow-600">
                    <th class="border border-yellow-500 p-2">Feature</th>
                </tr>
            </thead>
            <tbody>
                <tr id="typeRow"><td class="border border-yellow-500 p-2 font-semibold">Type</td></tr>
                <tr id="manufacturerRow"><td class="border border-yellow-500 p-2 font-semibold">Manufacturer</td></tr>
                <tr id="modelRow"><td class="border border-yellow-500 p-2 font-semibold">Model</td></tr>
                <tr id="capacityRow"><td class="border border-yellow-500 p-2 font-semibold">Max Load Capacity</td></tr>
                <tr id="boomRow"><td class="border border-yellow-500 p-2 font-semibold">Boom Length</td></tr>
                <tr id="priceRow"><td class="border border-yellow-500 p-2 font-semibold">Price Range</td></tr>
                <tr id="applicationsRow"><td class="border border-yellow-500 p-2 font-semibold">Applications</td></tr>
                <tr id="imageRow"><td class="border border-yellow-500 p-2 font-semibold">Image</td></tr>
                <tr id="arRow"><td class="border border-yellow-500 p-2 font-semibold">AR Model</td></tr>

            </tbody>
        `;
        document.querySelector('#compare').appendChild(table);
    }

    document.getElementById('headerRow').innerHTML += `<th class="border border-yellow-500 p-2 text-center">${crane.model}</th>`;
    document.getElementById('typeRow').innerHTML += `<td class="border border-yellow-500 p-2 text-center">${crane.type}</td>`;
    document.getElementById('manufacturerRow').innerHTML += `<td class="border border-yellow-500 p-2 text-center">${crane.manufacturer}</td>`;
    document.getElementById('modelRow').innerHTML += `<td class="border border-yellow-500 p-2 text-center">${crane.model}</td>`;
    document.getElementById('capacityRow').innerHTML += `<td class="border border-yellow-500 p-2 text-center">${crane.max_load_capacity}</td>`;
    document.getElementById('boomRow').innerHTML += `<td class="border border-yellow-500 p-2 text-center">${crane.boom_length}</td>`;
    document.getElementById('priceRow').innerHTML += `<td class="border border-yellow-500 p-2 text-center">${crane.price_range}</td>`;
    document.getElementById('applicationsRow').innerHTML += `<td class="border border-yellow-500 p-2 text-center">${crane.applications.join(', ')}</td>`;
    document.getElementById('imageRow').innerHTML += `
        <td class="border border-yellow-500 p-2 text-center">
            <img src="${crane.image}" alt="${crane.model}" class="mx-auto w-32 h-auto border rounded shadow"/>
        </td>`;
        const arButtonOrMessage = crane.ar_link 
    ? `<button onclick="viewARModel('${crane.ar_link}')" 
               class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-400">
               View in AR
       </button>`
    : `<p class="text-red-500 text-center">Not Available</p>`;

document.getElementById('arRow').innerHTML += `
    <td class="border border-yellow-500 p-2 text-center">
        ${arButtonOrMessage}
    </td>`;


}
    const analyzeBtn = document.getElementById("analyzeBtn");
    const weightInput = document.getElementById("weightInput");
    const radiusInput = document.getElementById("radiusInput");
    const resultText = document.getElementById("resultText");
    const ctx = document.getElementById("loadChart").getContext("2d");

    let chartInstance;

    analyzeBtn.addEventListener("click", function (event) {
        event.preventDefault();

        let weight = parseFloat(weightInput.value);
        let radius = parseFloat(radiusInput.value);

        if (isNaN(weight) || isNaN(radius) || weight <= 0 || radius <= 0) {
            resultText.innerHTML = `<span class="text-red-500">Please enter valid values!</span>`;
            return;
        }

        let loadMoment = weight * radius;
        resultText.innerHTML = `<strong>Load Moment: ${loadMoment.toFixed(2)} kNm</strong>`;

        // Destroy existing chart before creating a new one
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Create Chart Visualization
        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Weight (kg)", "Lifting Radius (m)", "Load Moment (kNm)"],
                datasets: [
                    {
                        label: "Load Distribution",
                        data: [weight, radius, loadMoment],
                        backgroundColor: ["#facc15", "#4ade80", "#f43f5e"],
                        borderColor: ["#eab308", "#22c55e", "#dc2626"],
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    });
