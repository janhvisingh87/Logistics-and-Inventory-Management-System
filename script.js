// --- Router Logic (SPA) ---
function switchView(viewId) {
    // 1. Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const clickedItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if(clickedItem) clickedItem.classList.add('active');

    // 2. Hide all views and show active
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    const activeView = document.getElementById(`view-${viewId}`);
    if(activeView) activeView.classList.add('active');

    // 3. Update Title based on view
    const titleElement = document.getElementById('pageTitle');
    const titles = {
        'dashboard': 'Overview Dashboard',
        'inventory': 'Master Inventory',
        'logistics': 'Fleet Logistics & Tracking',
        'orders': 'Order Management',
        'reports': 'Analytics Engine'
    };
    if(titleElement) titleElement.textContent = titles[viewId] || 'Dashboard';
    
    // Auto-close sidebar on mobile after clicking
    const sidebar = document.getElementById('sidebar');
    if(window.innerWidth <= 768 && sidebar.classList.contains('active')){
        sidebar.classList.remove('active');
    }
    
    // Fix map sizing when opening logistics view
    if (viewId === 'logistics' && window.fleetMap) {
        setTimeout(() => {
            window.fleetMap.invalidateSize();
        }, 100);
    }
}

// --- Sidebar Toggle for Mobile ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// --- Modal Logic ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.remove('active');
    }
}

// Form saving logic
function saveItem(e) {
    e.preventDefault();
    const btn = e.target.closest('.btn-primary');
    const originalText = btn.innerHTML;
    
    const modal = document.getElementById('addItemModal');
    const inputs = modal.querySelectorAll('input');
    const selects = modal.querySelectorAll('select');
    
    const name = inputs[0].value;
    const sku = inputs[1].value;
    const category = selects[0].value;
    const initialStock = inputs[2].value || '0';
    const threshold = inputs[3].value || '0';
    
    if(!name || !sku) {
        alert("Please fill in Product Name and SKU.");
        return;
    }

    const stockStatusClass = parseInt(initialStock) === 0 ? "status-out-stock" : (parseInt(initialStock) <= parseInt(threshold) ? "status-low-stock" : "status-in-stock");
    const stockStatusText = parseInt(initialStock) === 0 ? "Out of Stock" : (parseInt(initialStock) <= parseInt(threshold) ? "Low Stock" : "In Stock");

    if (window.activeEditRow) {
        // Update existing row
        const cells = window.activeEditRow.querySelectorAll('td');
        cells[0].innerHTML = sku;
        cells[1].innerHTML = `<strong>${name}</strong>`;
        cells[2].innerHTML = category;
        cells[4].innerHTML = `<strong>${initialStock}</strong> / ${threshold}`;
        cells[6].innerHTML = `<span class="statusBadge ${stockStatusClass}">${stockStatusText}</span>`;
    } else {
        // Create new row
        const tbody = document.querySelector('#view-inventory tbody');
        if (tbody) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sku}</td>
                <td><strong>${name}</strong></td>
                <td>${category}</td>
                <td>Zone A - Default</td>
                <td><strong>${initialStock}</strong> / ${threshold}</td>
                <td>₹0.00</td>
                <td><span class="statusBadge ${stockStatusClass}">${stockStatusText}</span></td>
                <td>
                    <div style="display:flex; gap:0.5rem; align-items:center; justify-content:center;">
                        <button class="icon-btn" style="width:32px; height:32px;" onclick="editItem(this)"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn" style="width:32px; height:32px; color:var(--danger);" onclick="deleteItem(this)"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        }
    }
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
        btn.style.background = 'var(--success)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = ''; // reset
            closeModal('addItemModal');
            window.activeEditRow = null; 
        }, 800);
    }, 500);
}

// --- Initialize Chart on Load ---
document.addEventListener("DOMContentLoaded", function() {
    // Initialize Dashboard Chart (Chart.js)
    const ctx = document.getElementById('dashboardChart');
    if (!ctx) return;

    // Dark theme styled chart
    Chart.defaults.color = '#8b949e';
    Chart.defaults.font.family = "'Outfit', sans-serif";
    
    const gradientPrimary = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradientPrimary.addColorStop(0, 'rgba(88, 166, 255, 0.5)');
    gradientPrimary.addColorStop(1, 'rgba(88, 166, 255, 0.0)');

    const gradientSecondary = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradientSecondary.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
    gradientSecondary.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Revenue (₹)',
                    data: [1200000, 1900000, 1500000, 2500000, 2200000, 3000000, 2800000],
                    borderColor: '#58a6ff',
                    backgroundColor: gradientPrimary,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#0d1117',
                    pointBorderColor: '#58a6ff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Logistics Cost (₹)',
                    data: [800000, 1200000, 1000000, 1400000, 1300000, 1800000, 1600000],
                    borderColor: '#8b5cf6',
                    backgroundColor: gradientSecondary,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#0d1117',
                    pointBorderColor: '#8b5cf6',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { boxWidth: 10, usePointStyle: true }
                },
                tooltip: {
                    backgroundColor: 'rgba(22, 27, 34, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#c9d1d9',
                    borderColor: 'rgba(240, 246, 252, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: true,
                    mode: 'index',
                    intersect: false
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(240, 246, 252, 0.05)', drawBorder: false },
                    ticks: { callback: function(value) { return '₹' + value / 100000 + 'L'; } }
                },
                x: {
                    grid: { display: false, drawBorder: false }
                }
            }
        }
    });

    // Simple script to test close modal when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // --- Leaflet Fleet Map Initialization ---
    const mapElement = document.getElementById('fleetMap');
    if (mapElement && typeof L !== 'undefined') {
        // Init map centered on India
        window.fleetMap = L.map('fleetMap', {
            zoomControl: true,
            minZoom: 4
        }).setView([21.5937, 78.9629], 5);

        // CartoDB Dark Matter for sleek design
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CartoDB',
            maxZoom: 19
        }).addTo(window.fleetMap);

        // Custom pulsing marker icon
        const pulsingIcon = L.divIcon({
            className: 'custom-pulsing-icon',
            html: '<div class="map-node" style="position:relative; top:0; left:0;"></div>',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
            popupAnchor: [0, -10]
        });

        // Add dummy shipments to India
        const shipments = [
            { id: '#112', lat: 28.6139, lng: 77.2090, city: 'Delhi' },
            { id: '#88', lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
            { id: '#92', lat: 12.9716, lng: 77.5946, city: 'Bangalore' },
            { id: '#104', lat: 13.0827, lng: 80.2707, city: 'Chennai' },
            { id: '#150', lat: 22.5726, lng: 88.3639, city: 'Kolkata' }
        ];

        window.cityMarkers = {};
        shipments.forEach(ship => {
            const marker = L.marker([ship.lat, ship.lng], { icon: pulsingIcon })
                .addTo(window.fleetMap)
                .bindPopup(`<strong>Shipment ${ship.id}</strong><br>Location: ${ship.city}<br>Status: In Transit`);
            
            window.cityMarkers[ship.city] = marker;
        });
    }
});

// --- Slider & Off-canvas Logic ---
function openSlider(sliderId) {
    const slider = document.getElementById(sliderId);
    if(slider) {
        slider.classList.add('active');
        const overlay = document.getElementById('sliderOverlay');
        if(overlay) overlay.classList.add('active');
    }
}

function closeSlider(sliderId) {
    const slider = document.getElementById(sliderId);
    if(slider) {
        slider.classList.remove('active');
        
        // Check if any other slider is still active
        const anyActive = document.querySelectorAll('.side-slider.active').length > 0;
        if(!anyActive) {
            const overlay = document.getElementById('sliderOverlay');
            if(overlay) overlay.classList.remove('active');
        }
    }
}

function closeAllSliders() {
    document.querySelectorAll('.side-slider').forEach(slider => {
        slider.classList.remove('active');
    });
    const overlay = document.getElementById('sliderOverlay');
    if(overlay) overlay.classList.remove('active');
}

// --- Inline Action Handlers ---
function openAddModal() {
    window.activeEditRow = null;
    const modal = document.getElementById('addItemModal');
    if (!modal) return;
    
    // Reset Title
    modal.querySelector('h3').textContent = 'Add New Product';
    // Clear inputs
    modal.querySelectorAll('input').forEach(i => i.value = '');
    // Reset selects
    modal.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
    
    openModal('addItemModal');
}

function editItem(btn) {
    const row = btn.closest('tr');
    if (!row) return;
    window.activeEditRow = row;
    const cells = row.querySelectorAll('td');
    const modal = document.getElementById('addItemModal');
    if (!modal || cells.length < 5) return;
    
    modal.querySelector('h3').textContent = 'Edit Product';
    
    const inputs = modal.querySelectorAll('input');
    const selects = modal.querySelectorAll('select');
    
    // Product Name (cells[1])
    if(inputs[0]) inputs[0].value = cells[1].innerText.trim();
    // SKU (cells[0])
    if(inputs[1]) inputs[1].value = cells[0].innerText.trim();
    
    // Category (cells[2])
    const categoryText = cells[2].innerText.trim();
    if (selects[0]) {
        Array.from(selects[0].options).forEach((opt, idx) => {
            if(opt.text.includes(categoryText)) selects[0].selectedIndex = idx;
        });
    }
    
    // Stock (cells[4])
    const stockParts = cells[4].innerText.split('/');
    if(stockParts.length === 2) {
        if(inputs[2]) inputs[2].value = stockParts[0].trim();
        if(inputs[3]) inputs[3].value = stockParts[1].trim();
    }
    
    openModal('addItemModal');
}

function deleteItem(btn) {
    if(confirm("Are you sure you want to delete this record?")) {
        const row = btn.closest('tr');
        if(row) {
            row.style.transition = 'opacity 0.3s ease';
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
            }, 300);
        }
    }
}

function openOrderModal() {
    const modal = document.getElementById('createOrderModal');
    if(!modal) return;
    modal.querySelectorAll('input').forEach(i => i.value = '');
    modal.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
    openModal('createOrderModal');
}

function saveOrder(e) {
    e.preventDefault();
    const btn = e.target.closest('.btn-primary');
    const originalText = btn.innerHTML;
    
    const customer = document.getElementById('orderCustomer').value;
    const items = document.getElementById('orderItems').value || '1';
    const val = document.getElementById('orderValue').value || '0';
    const payment = document.getElementById('orderPayment').value;
    const status = document.getElementById('orderStatus').value;
    
    if(!customer) {
        alert("Please enter a customer name.");
        return;
    }

    const tbody = document.querySelector('#view-orders tbody');
    if (tbody) {
        const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
        const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        
        let paymentHTML = '';
        if(payment === 'Paid') paymentHTML = '<span style="color:var(--success)"><i class="fa-solid fa-check"></i> Paid</span>';
        else if(payment === 'Pending') paymentHTML = '<span style="color:var(--warning)"><i class="fa-solid fa-hourglass-half"></i> Pending</span>';
        else paymentHTML = '<span style="color:var(--danger)"><i class="fa-solid fa-xmark"></i> Failed</span>';
        
        let statusBadge = 'status-pending';
        if(status === 'Shipped') statusBadge = 'status-shipped';
        else if(status === 'Processing') statusBadge = 'status-pending';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${orderId}</strong></td>
            <td>${customer}</td>
            <td>${date}</td>
            <td>${items}</td>
            <td>₹${parseFloat(val).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${paymentHTML}</td>
            <td><span class="statusBadge ${statusBadge}">${status}</span></td>
            <td><button class="icon-btn" style="width:32px; height:32px; color:var(--danger);" onclick="deleteItem(this)"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.prepend(tr);
    }
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
        btn.style.background = 'var(--success)';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            closeModal('createOrderModal');
        }, 800);
    }, 500);
}

function generateWeeklyReport() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const content = `==================================================
LOGISTICS AND INVENTORY MANAGEMENT SYSTEM - WEEKLY LOGISTICS REPORT
Date Generated: ${dateStr}
==================================================

[INVENTORY SUMMARY]
Total Products Handled: 4,500
Low Stock Alerts: 3
Out of Stock Items: 1

[ORDER MANAGEMENT]
Orders Processed: 132
Orders Pending: 12
Orders Failed: 1
Total Revenue (Weekly): ₹45,25,000.00

[LOGISTICS & FLEET]
Active Shipments: 24
Delayed Deliveries: 2
Fleet Utilization: 88%

[SYSTEM NOTES]
All metrics are performing within normal operational boundaries.
Please review the Low Stock alerts directly in the Inventory Tab.
Supply chain bottlenecks detected near Zone C (CHI). 

==================================================
End of Report`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly_report_${now.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportAllDataArchive() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN');
    
    let content = `==================================================\n`;
    content += `LOGISTICS AND INVENTORY MANAGEMENT SYSTEM - FULL DATA ARCHIVE\n`;
    content += `Date Exported: ${dateStr}\n`;
    content += `==================================================\n\n`;

    // Scrape Inventory Data
    content += `[ 1. MASTER INVENTORY EXTRACT ]\n`;
    content += `--------------------------------------------------\n`;
    const invRows = document.querySelectorAll('#view-inventory tbody tr');
    if (invRows.length === 0) content += `No inventory records available.\n`;
    invRows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 7) {
            const sku = cells[0].innerText.trim();
            const name = cells[1].innerText.trim();
            const category = cells[2].innerText.trim();
            const zone = cells[3].innerText.trim();
            const stock = cells[4].innerText.trim().replace(/\n/g, '');
            const value = cells[5].innerText.trim();
            const status = cells[6].innerText.trim();
            content += `${index + 1}. SKU: ${sku} | Name: ${name} | Category: ${category} | Zone: ${zone} | Stock: ${stock} | Value: ${value} | Status: ${status}\n`;
        }
    });

    content += `\n[ 2. ORDER MANAGEMENT EXTRACT ]\n`;
    content += `--------------------------------------------------\n`;
    const orderRows = document.querySelectorAll('#view-orders tbody tr');
    if (orderRows.length === 0) content += `No order records available.\n`;
    orderRows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 7) {
            const orderId = cells[0].innerText.trim();
            const customer = cells[1].innerText.trim();
            const date = cells[2].innerText.trim();
            const items = cells[3].innerText.trim();
            const value = cells[4].innerText.trim();
            // remove icons from innerText if any
            const payment = cells[5].innerText.trim();
            const status = cells[6].innerText.trim();
            content += `${index + 1}.
