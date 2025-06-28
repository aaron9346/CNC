const API_URL = 'https://script.google.com/macros/s/AKfycbwAPQWJyFdkVFcuxcn8FOf_3Sg3w7Hdw-_0dx3ArQoZWgp68iNd86g5oHCQ_HW1JgrN/exec';

document.addEventListener('DOMContentLoaded', async () => {
    // Load machines for filter
    await loadMachines();
    
    // Load initial history data
    await loadProductionHistory();
    
    // Setup filter change listener
    document.getElementById('machineFilter').addEventListener('change', loadProductionHistory);
});

async function loadMachines() {
    try {
        const response = await fetch(`${API_URL}?action=getMasters`);
        const { machines } = await response.json();
        
        const select = document.getElementById('machineFilter');
        select.innerHTML = '<option value="">All Machines</option>' +
            machines.map(machine => `<option value="${machine}">${machine}</option>`).join('');
    } catch (error) {
        console.error('Failed to load machines:', error);
    }
}

async function loadProductionHistory() {
    const machineFilter = document.getElementById('machineFilter').value;
    
    try {
        let url = `${API_URL}?action=getProductionHistory`;
        if (machineFilter) url += `&machineNo=${encodeURIComponent(machineFilter)}`;
        
        const response = await fetch(url);
        const historyData = await response.json();
        
        renderHistoryTable(historyData);
    } catch (error) {
        console.error('Failed to load history:', error);
        alert('Failed to load production history. Please try again.');
    }
}

function renderHistoryTable(data) {
    const tbody = document.querySelector('#historyTable tbody');
    tbody.innerHTML = data.map(entry => `
        <tr>
            <td>${entry.Date || ''}</td>
            <td>${entry.MachineNo || ''}</td>
            <td>${entry.Operator || ''}</td>
            <td>${entry.Shift || ''}</td>
            <td>${entry.PartNo || ''}</td>
            <td>${entry.CycleTime || ''}</td>
            <td>${entry.OutputQty || 0}</td>
            <td>${entry.RejectQty || 0}</td>
            <td>${entry.TotalQty || 0}</td>
            <td>${entry.Performance ? entry.Performance + '%' : ''}</td>
        </tr>
    `).join('');
}