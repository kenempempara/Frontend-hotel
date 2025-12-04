// API Configuration
const API_BASE_URL = 'https://management-hotel.onrender.com';
let cachedData = {
    rooms: [],
    guests: [],
    bookings: []
};

// DOM Elements
let apiStatusElement;
let roomsTableBody;
let guestsTableBody;
let bookingsTableBody;

// Helper Functions
function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    apiStatusElement = document.getElementById('apiStatus');
    roomsTableBody = document.getElementById('roomsTableBody');
    guestsTableBody = document.getElementById('guestsTableBody');
    bookingsTableBody = document.getElementById('bookingsTableBody');
    
    // Set API URL in footer
    document.getElementById('apiUrl').textContent = API_BASE_URL;
    
    // Setup event listeners
    setupEventListeners();
    
    // Check API connection
    checkAPIStatus();
    
    // Load initial data
    loadAllData();
    
    // Setup tab switching
    setupTabs();
    
    // Setup form submissions
    setupForms();
    
    // Initialize dates
    initializeDates();
});

// Setup Event Listeners
function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

// Setup Forms
function setupForms() {
    // Room Form
    document.getElementById('roomFormElement').addEventListener('submit', handleRoomSubmit);
    
    // Guest Form
    document.getElementById('guestFormElement').addEventListener('submit', handleGuestSubmit);
    
    // Booking Form
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
}

// Check API Status
async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
            apiStatusElement.textContent = '✅ API Connected';
            apiStatusElement.className = 'connected';
            showToast('API connected successfully!', 'success');
        } else {
            apiStatusElement.textContent = '❌ API Error';
            apiStatusElement.className = 'disconnected';
            showToast('API connection failed', 'error');
        }
    } catch (error) {
        apiStatusElement.textContent = '❌ API Offline';
        apiStatusElement.className = 'disconnected';
        showToast('Cannot connect to API', 'error');
    }
}

// Load All Data
async function loadAllData() {
    showToast('Loading data...', 'info');
    
    try {
        // Load rooms
        const roomsResponse = await fetch(`${API_BASE_URL}/api/rooms`);
        if (roomsResponse.ok) {
            const roomsData = await roomsResponse.json();
            cachedData.rooms = Array.isArray(roomsData) ? roomsData : roomsData.data || [];
            renderRoomsTable();
            updateDashboardStats();
            updateRoomDropdown();
        }
        
        // Load guests
        const guestsResponse = await fetch(`${API_BASE_URL}/api/guests`);
        if (guestsResponse.ok) {
            const guestsData = await guestsResponse.json();
            cachedData.guests = Array.isArray(guestsData) ? guestsData : guestsData.data || [];
            renderGuestsTable();
            updateDashboardStats();
            updateGuestDropdown();
        }
        
        // Load bookings
        const bookingsResponse = await fetch(`${API_BASE_URL}/api/bookings`);
        if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            cachedData.bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData.data || [];
            renderBookingsTable();
            updateDashboardStats();
        }
        
        showToast('Data loaded successfully!', 'success');
    } catch (error) {
        showToast('Error loading data: ' + error.message, 'error');
    }
}

// Update Dashboard Stats
function updateDashboardStats() {
    // Available rooms
    const availableRooms = cachedData.rooms.filter(room => room.status === 'available').length;
    document.getElementById('availableRooms').textContent = availableRooms;
    
    // Occupied rooms
    const occupiedRooms = cachedData.rooms.filter(room => room.status === 'occupied').length;
    document.getElementById('occupiedRooms').textContent = occupiedRooms;
    
    // Total guests
    document.getElementById('totalGuests').textContent = cachedData.guests.length;
    
    // Active bookings
    const activeBookings = cachedData.bookings.filter(booking => 
        booking.status === 'confirmed' || booking.status === 'checked-in'
    ).length;
    document.getElementById('activeBookings').textContent = activeBookings;
    
    // Update alerts
    updateAlerts();
}

// Update Alerts
function updateAlerts() {
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';
    
    // Check for maintenance rooms
    const maintenanceRooms = cachedData.rooms.filter(room => room.status === 'maintenance');
    if (maintenanceRooms.length > 0) {
        const alert = document.createElement('div');
        alert.className = 'alert';
        alert.innerHTML = `
            <i class="fas fa-tools"></i>
            <span>${maintenanceRooms.length} room(s) under maintenance</span>
        `;
        alertsList.appendChild(alert);
    }
    
    // Check for pending payments
    const pendingPayments = cachedData.bookings.filter(booking => booking.paymentStatus === 'pending');
    if (pendingPayments.length > 0) {
        const alert = document.createElement('div');
        alert.className = 'alert';
        alert.innerHTML = `
            <i class="fas fa-credit-card"></i>
            <span>${pendingPayments.length} booking(s) with pending payment</span>
        `;
        alertsList.appendChild(alert);
    }
    
    // Check for check-ins today
    const today = new Date().toISOString().split('T')[0];
    const todayCheckIns = cachedData.bookings.filter(booking => 
        booking.checkIn && booking.checkIn.split('T')[0] === today
    );
    if (todayCheckIns.length > 0) {
        const alert = document.createElement('div');
        alert.className = 'alert';
        alert.innerHTML = `
            <i class="fas fa-sign-in-alt"></i>
            <span>${todayCheckIns.length} check-in(s) today</span>
        `;
        alertsList.appendChild(alert);
    }
    
    // If no alerts
    if (alertsList.children.length === 0) {
        const alert = document.createElement('div');
        alert.className = 'alert';
        alert.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>All systems operational</span>
        `;
        alertsList.appendChild(alert);
    }
}

// Render Rooms Table
function renderRoomsTable() {
    roomsTableBody.innerHTML = '';
    
    const filteredRooms = filterRooms();
    
    if (filteredRooms.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7">
                <div class="empty-state">
                    <i class="fas fa-bed empty-state-icon"></i>
                    <p>No rooms found</p>
                </div>
            </td>
        `;
        roomsTableBody.appendChild(row);
        return;
    }
    
    filteredRooms.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${room.number}</strong></td>
            <td><span class="type-badge type-${room.type}">${room.type.charAt(0).toUpperCase() + room.type.slice(1)}</span></td>
            <td>₱${room.price.toLocaleString()}</td>
            <td><span class="status-badge status-${room.status}">${room.status.charAt(0).toUpperCase() + room.status.slice(1)}</span></td>
            <td>${room.capacity} guest(s)</td>
            <td>${Array.isArray(room.amenities) ? room.amenities.join(', ') : ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn-small edit" onclick="editRoom('${room._id}')" aria-label="Edit room ${room.number}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn-small delete" onclick="deleteRoom('${room._id}')" aria-label="Delete room ${room.number}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        roomsTableBody.appendChild(row);
    });
}

// Filter Rooms
function filterRooms() {
    const statusFilter = document.getElementById('roomFilterStatus').value;
    const typeFilter = document.getElementById('roomFilterType').value;
    
    return cachedData.rooms.filter(room => {
        const matchesStatus = !statusFilter || room.status === statusFilter;
        const matchesType = !typeFilter || room.type === typeFilter;
        return matchesStatus && matchesType;
    });
}

// Render Guests Table
function renderGuestsTable() {
    guestsTableBody.innerHTML = '';
    
    if (cachedData.guests.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6">
                <div class="empty-state">
                    <i class="fas fa-users empty-state-icon"></i>
                    <p>No guests found</p>
                </div>
            </td>
        `;
        guestsTableBody.appendChild(row);
        return;
    }
    
    cachedData.guests.forEach(guest => {
        const row = document.createElement('tr');
        const address = guest.address ? 
            `${guest.address.street || ''} ${guest.address.city || ''} ${guest.address.country || ''}`.trim() : 
            'No address';
        
        row.innerHTML = `
            <td><strong>${guest.name}</strong></td>
            <td>${guest.email}</td>
            <td>${guest.phone}</td>
            <td>${guest.idProof}: ${guest.idNumber}</td>
            <td>${address}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn-small edit" onclick="editGuest('${guest._id}')" aria-label="Edit guest ${guest.name}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn-small delete" onclick="deleteGuest('${guest._id}')" aria-label="Delete guest ${guest.name}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <button class="action-btn-small view" onclick="viewGuestBookings('${guest._id}')" aria-label="View bookings for ${guest.name}">
                        <i class="fas fa-calendar"></i> Bookings
                    </button>
                </div>
            </td>
        `;
        guestsTableBody.appendChild(row);
    });
}

// Render Bookings Table
function renderBookingsTable() {
    bookingsTableBody.innerHTML = '';
    
    if (cachedData.bookings.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8">
                <div class="empty-state">
                    <i class="fas fa-calendar empty-state-icon"></i>
                    <p>No bookings found</p>
                </div>
            </td>
        `;
        bookingsTableBody.appendChild(row);
        return;
    }
    
    cachedData.bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        // Find guest and room details
        const guest = cachedData.guests.find(g => g._id === booking.guestId) || {};
        const room = cachedData.rooms.find(r => r._id === booking.roomId) || {};
        
        const checkIn = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '-';
        const checkOut = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '-';
        
        row.innerHTML = `
            <td><small>${booking._id ? booking._id.substring(0, 8) : 'N/A'}</small></td>
            <td>${guest.name || 'Guest not found'}</td>
            <td>${room.number || 'Room not found'}</td>
            <td>${checkIn}</td>
            <td>${checkOut}</td>
            <td><span class="status-badge">${booking.status || 'confirmed'}</span></td>
            <td>₱${(booking.totalAmount || 0).toLocaleString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn-small edit" onclick="editBooking('${booking._id}')" aria-label="Edit booking">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn-small delete" onclick="deleteBooking('${booking._id}')" aria-label="Delete booking">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        bookingsTableBody.appendChild(row);
    });
}

// Room Form Functions
function showRoomForm(roomId = null) {
    const title = document.getElementById('roomFormTitle');
    
    if (roomId) {
        // Edit mode
        title.textContent = 'Edit Room';
        const room = cachedData.rooms.find(r => r._id === roomId);
        if (room) {
            document.getElementById('roomId').value = room._id;
            document.getElementById('roomNumber').value = room.number;
            document.getElementById('roomType').value = room.type;
            document.getElementById('roomPrice').value = room.price;
            document.getElementById('roomCapacity').value = room.capacity;
            document.getElementById('roomStatus').value = room.status;
            
            // Set amenities checkboxes
            const amenities = Array.isArray(room.amenities) ? room.amenities : [];
            document.querySelectorAll('.amenities-checkboxes input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = amenities.includes(checkbox.value);
            });
        }
    } else {
        // Add mode
        title.textContent = 'Add New Room';
        document.getElementById('roomFormElement').reset();
        document.getElementById('roomId').value = '';
    }
    
    showElement('roomForm');
    document.getElementById('roomForm').scrollIntoView({ behavior: 'smooth' });
}

function hideRoomForm() {
    hideElement('roomForm');
}

async function handleRoomSubmit(event) {
    event.preventDefault();
    
    const roomId = document.getElementById('roomId').value;
    const isEdit = !!roomId;
    
    const roomData = {
        number: document.getElementById('roomNumber').value,
        type: document.getElementById('roomType').value,
        price: parseFloat(document.getElementById('roomPrice').value),
        capacity: parseInt(document.getElementById('roomCapacity').value),
        status: document.getElementById('roomStatus').value,
        amenities: Array.from(document.querySelectorAll('.amenities-checkboxes input[type="checkbox"]:checked'))
            .map(cb => cb.value)
    };
    
    const url = roomId ? `${API_BASE_URL}/api/rooms/${roomId}` : `${API_BASE_URL}/api/rooms`;
    const method = roomId ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(roomData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showToast(isEdit ? 'Room updated successfully!' : 'Room created successfully!', 'success');
            hideRoomForm();
            loadAllData();
        } else {
            const error = await response.json();
            showToast(`Error: ${error.error || 'Failed to save room'}`, 'error');
        }
    } catch (error) {
        showToast('Network error: ' + error.message, 'error');
    }
}

// Guest Form Functions
function showGuestForm(guestId = null) {
    const title = document.getElementById('guestFormTitle');
    
    if (guestId) {
        // Edit mode
        title.textContent = 'Edit Guest';
        const guest = cachedData.guests.find(g => g._id === guestId);
        if (guest) {
            document.getElementById('guestId').value = guest._id;
            document.getElementById('guestName').value = guest.name;
            document.getElementById('guestEmail').value = guest.email;
            document.getElementById('guestPhone').value = guest.phone;
            document.getElementById('guestIdProof').value = guest.idProof;
            document.getElementById('guestIdNumber').value = guest.idNumber;
            
            // Address fields
            if (guest.address) {
                document.getElementById('guestStreet').value = guest.address.street || '';
                document.getElementById('guestCity').value = guest.address.city || '';
                document.getElementById('guestCountry').value = guest.address.country || '';
            }
        }
    } else {
        // Add mode
        title.textContent = 'Add New Guest';
        document.getElementById('guestFormElement').reset();
        document.getElementById('guestId').value = '';
    }
    
    showElement('guestForm');
    document.getElementById('guestForm').scrollIntoView({ behavior: 'smooth' });
}

function hideGuestForm() {
    hideElement('guestForm');
}

async function handleGuestSubmit(event) {
    event.preventDefault();
    
    const guestId = document.getElementById('guestId').value;
    const isEdit = !!guestId;
    
    const guestData = {
        name: document.getElementById('guestName').value,
        email: document.getElementById('guestEmail').value,
        phone: document.getElementById('guestPhone').value,
        idProof: document.getElementById('guestIdProof').value,
        idNumber: document.getElementById('guestIdNumber').value,
        address: {
            street: document.getElementById('guestStreet').value,
            city: document.getElementById('guestCity').value,
            country: document.getElementById('guestCountry').value
        }
    };
    
    const url = guestId ? `${API_BASE_URL}/api/guests/${guestId}` : `${API_BASE_URL}/api/guests`;
    const method = guestId ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(guestData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showToast(isEdit ? 'Guest updated successfully!' : 'Guest created successfully!', 'success');
            hideGuestForm();
            loadAllData();
        } else {
            const error = await response.json();
            showToast(`Error: ${error.error || 'Failed to save guest'}`, 'error');
        }
    } catch (error) {
        showToast('Network error: ' + error.message, 'error');
    }
}

// Booking Form Functions
function updateRoomDropdown() {
    const select = document.getElementById('bookingRoom');
    select.innerHTML = '<option value="">Select Room</option>';
    
    const availableRooms = cachedData.rooms.filter(room => room.status === 'available');
    
    availableRooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room._id;
        option.textContent = `${room.number} - ${room.type} (₱${room.price}/night, Capacity: ${room.capacity})`;
        select.appendChild(option);
    });
}

function updateGuestDropdown() {
    const select = document.getElementById('bookingGuest');
    select.innerHTML = '<option value="">Select Guest</option>';
    
    cachedData.guests.forEach(guest => {
        const option = document.createElement('option');
        option.value = guest._id;
        option.textContent = `${guest.name} (${guest.email})`;
        select.appendChild(option);
    });
}

function loadGuestDetails() {
    const guestId = document.getElementById('bookingGuest').value;
    const guest = cachedData.guests.find(g => g._id === guestId);
    
    if (guest) {
        document.getElementById('previewGuestName').textContent = guest.name;
        document.getElementById('previewGuestEmail').textContent = guest.email;
        document.getElementById('previewGuestPhone').textContent = guest.phone;
        document.getElementById('previewGuestId').textContent = `${guest.idProof}: ${guest.idNumber}`;
        showElement('guestDetails');
    } else {
        hideElement('guestDetails');
    }
}

function loadRoomDetails() {
    const roomId = document.getElementById('bookingRoom').value;
    const room = cachedData.rooms.find(r => r._id === roomId);
    
    if (room) {
        document.getElementById('previewRoomNumber').textContent = room.number;
        document.getElementById('previewRoomType').textContent = room.type;
        document.getElementById('previewRoomPrice').textContent = room.price.toLocaleString();
        document.getElementById('previewRoomCapacity').textContent = room.capacity;
        document.getElementById('previewRoomAmenities').textContent = Array.isArray(room.amenities) ? room.amenities.join(', ') : '';
        showElement('roomDetails');
        
        calculateTotal();
    } else {
        hideElement('roomDetails');
    }
}

function calculateTotal() {
    const roomId = document.getElementById('bookingRoom').value;
    const checkIn = document.getElementById('bookingCheckIn').value;
    const checkOut = document.getElementById('bookingCheckOut').value;
    const room = cachedData.rooms.find(r => r._id === roomId);
    
    if (room && checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        if (nights > 0) {
            const total = room.price * nights;
            
            document.getElementById('summaryNights').textContent = nights;
            document.getElementById('summaryPrice').textContent = room.price.toLocaleString();
            document.getElementById('summaryTotal').textContent = total.toLocaleString();
        }
    }
}

async function handleBookingSubmit(event) {
    event.preventDefault();
    
    const bookingData = {
        guestId: document.getElementById('bookingGuest').value,
        roomId: document.getElementById('bookingRoom').value,
        checkIn: document.getElementById('bookingCheckIn').value,
        checkOut: document.getElementById('bookingCheckOut').value,
        numberOfGuests: parseInt(document.getElementById('bookingGuests').value),
        paymentStatus: document.getElementById('bookingPaymentStatus').value,
        specialRequests: document.getElementById('bookingSpecialRequests').value,
        status: 'confirmed'
    };
    
    // Validate dates
    if (new Date(bookingData.checkIn) >= new Date(bookingData.checkOut)) {
        showToast('Check-out date must be after check-in date', 'error');
        return;
    }
    
    // Validate number of guests
    const selectedRoom = cachedData.rooms.find(r => r._id === bookingData.roomId);
    if (selectedRoom && bookingData.numberOfGuests > selectedRoom.capacity) {
        showToast(`Number of guests exceeds room capacity (max: ${selectedRoom.capacity})`, 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showToast('Booking created successfully!', 'success');
            
            // Reset form
            event.target.reset();
            hideElement('guestDetails');
            hideElement('roomDetails');
            
            // Switch to bookings tab
            switchTab('bookings');
            
            // Reload data
            loadAllData();
        } else {
            const error = await response.json();
            showToast(`Error: ${error.error || 'Failed to create booking'}`, 'error');
        }
    } catch (error) {
        showToast('Network error: ' + error.message, 'error');
    }
}

// Delete Functions
async function deleteRoom(roomId) {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Room deleted successfully!', 'success');
            loadAllData();
        } else {
            const error = await response.json();
            showToast(`Error: ${error.error || 'Failed to delete room'}`, 'error');
        }
    } catch (error) {
        showToast('Network error: ' + error.message, 'error');
    }
}

async function deleteGuest(guestId) {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/guests/${guestId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Guest deleted successfully!', 'success');
            loadAllData();
        } else {
            const error = await response.json();
            showToast(`Error: ${error.error || 'Failed to delete guest'}`, 'error');
        }
    } catch (error) {
        showToast('Network error: ' + error.message, 'error');
    }
}

async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Booking deleted successfully!', 'success');
            loadAllData();
        } else {
            const error = await response.json();
            showToast(`Error: ${error.error || 'Failed to delete booking'}`, 'error');
        }
    } catch (error) {
        showToast('Network error: ' + error.message, 'error');
    }
}

// Edit Functions
function editRoom(roomId) {
    showRoomForm(roomId);
    switchTab('rooms');
}

function editGuest(guestId) {
    showGuestForm(guestId);
    switchTab('guests');
}

async function editBooking(bookingId) {
    const booking = cachedData.bookings.find(b => b._id === bookingId);
    if (booking) {
        alert(`Edit booking for ID: ${bookingId}\n\nThis would open an edit form in a real application.`);
    }
}

function viewGuestBookings(guestId) {
    const guest = cachedData.guests.find(g => g._id === guestId);
    const guestBookings = cachedData.bookings.filter(b => b.guestId === guestId);
    
    if (guestBookings.length > 0) {
        let message = `Bookings for ${guest.name}:\n\n`;
        guestBookings.forEach((booking, index) => {
            const room = cachedData.rooms.find(r => r._id === booking.roomId);
            message += `${index + 1}. Room ${room ? room.number : 'N/A'} - ${booking.status}\n`;
            message += `   Check-in: ${new Date(booking.checkIn).toLocaleDateString()}\n`;
            message += `   Check-out: ${new Date(booking.checkOut).toLocaleDateString()}\n`;
            message += `   Amount: ₱${(booking.totalAmount || 0).toLocaleString()}\n\n`;
        });
        alert(message);
    } else {
        alert(`${guest.name} has no bookings.`);
    }
}

// Tab Management
function setupTabs() {
    // Set initial active tab
    switchTab('dashboard');
}

function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate corresponding tab button
    const selectedButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Update ARIA attributes
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.setAttribute('aria-selected', button.classList.contains('active'));
    });
    
    // Special handling for new booking tab
    if (tabId === 'newBooking') {
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        document.getElementById('bookingCheckIn').value = today;
        document.getElementById('bookingCheckOut').value = tomorrowStr;
        
        // Calculate total
        calculateTotal();
    }
}

// Toast Notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'flex';
    toast.setAttribute('aria-live', 'assertive');
    
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    toast.appendChild(announcement);
    
    setTimeout(() => {
        toast.style.display = 'none';
        toast.removeAttribute('aria-live');
        toast.innerHTML = '';
    }, 3000);
}

// Clear Local Data (for debugging)
function clearAllData() {
    if (confirm('Clear all locally cached data?')) {
        cachedData = {
            rooms: [],
            guests: [],
            bookings: []
        };
        renderRoomsTable();
        renderGuestsTable();
        renderBookingsTable();
        updateDashboardStats();
        showToast('Local data cleared', 'warning');
    }
}

// Initialize date inputs with today's date
function initializeDates() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
        // Set min date to today
        input.min = today;
    });
}

// Add keyboard navigation for tabs
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const tabs = Array.from(document.querySelectorAll('.tab-btn'));
        const currentTab = document.querySelector('.tab-btn.active');
        const currentIndex = tabs.indexOf(currentTab);
        
        if (event.key === 'ArrowRight') {
            const nextIndex = (currentIndex + 1) % tabs.length;
            tabs[nextIndex].click();
        } else if (event.key === 'ArrowLeft') {
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            tabs[prevIndex].click();
        }
    }
});