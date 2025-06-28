const API_URL = 'https://script.google.com/macros/s/AKfycbwAPQWJyFdkVFcuxcn8FOf_3Sg3w7Hdw-_0dx3ArQoZWgp68iNd86g5oHCQ_HW1JgrN/exec';

document.addEventListener('DOMContentLoaded', async () => {
    // Set default date
    document.getElementById('date').valueAsDate = new Date();
    
    // Load master data
    await loadMasters();
    
    // Initialize modals
    initModals();
    
    // Setup form submission
    document.getElementById('productionForm').addEventListener('submit', handleSubmit);
});

async function loadMasters() {
    try {
        const response = await fetch(`${API_URL}?action=getMasters`);
        const { machines, operators, parts } = await response.json();
        
        populateDropdown('machineNo', machines);
        populateDropdown('operator', operators);
        populateDropdown('partNo', parts);
    } catch (error) {
        console.error('Failed to load master data:', error);
        alert('Failed to load machine/operator/part data. Please refresh.');
    }
}

function populateDropdown(id, items) {
    const select = document.getElementById(id);
    select.innerHTML = `<option value="">Select ${id.replace(/([A-Z])/g, ' $1')}</option>` +
        items.map(item => `<option value="${item}">${item}</option>`).join('');
}

function initModals() {
    // Machine modal
    const machineModal = document.getElementById('addMachineModal');
    document.getElementById('addMachineBtn').addEventListener('click', () => {
        document.getElementById('newMachine').value = '';
        machineModal.style.display = 'block';
    });
    
    machineModal.querySelector('.close').addEventListener('click', () => {
        machineModal.style.display = 'none';
    });
    
    document.getElementById('saveMachineBtn').addEventListener('click', () => {
        saveMasterItem('machine');
    });
    
    // Similar setup for operator and part modals...
}

async function saveMasterItem(type) {
    const inputField = document.getElementById(`new${type.charAt(0).toUpperCase() + type.slice(1)}`);
    const value = inputField.value.trim();
    
    if (!value) return;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addMaster', type, value })
        });
        
        const { success, newValue } = await response.json();
        
        if (success) {
            // Add to dropdown and select it
            const select = document.getElementById(type === 'machine' ? 'machineNo' : type);
            const option = new Option(newValue, newValue);
            select.add(option);
            select.value = newValue;
            
            // Close modal
            document.getElementById(`add${type.charAt(0).toUpperCase() + type.slice(1)}Modal`).style.display = 'none';
        }
    } catch (error) {
        console.error(`Failed to add ${type}:`, error);
        alert(`Failed to add new ${type}. Please try again.`);
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        action: 'saveProduction',
        date: document.getElementById('date').value,
        machineNo: document.getElementById('machineNo').value,
        operator: document.getElementById('operator').value,
        shift: document.getElementById('shift').value,
        partNo: document.getElementById('partNo').value,
        cycleTime: document.getElementById('cycleTime').value,
        outputQty: parseInt(document.getElementById('outputQty').value) || 0,
        rejectQty: parseInt(document.getElementById('rejectQty').value) || 0
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const { success } = await response.json();
        
        if (success) {
            alert('Production data saved successfully!');
            document.getElementById('productionForm').reset();
            document.getElementById('date').valueAsDate = new Date();
        } else {
            alert('Failed to save data. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to save data. Please check your connection.');
    }
}