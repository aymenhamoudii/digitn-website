// booking.js - Global scope, handles form submission and validation
function initBookingForm() {
    const form = document.getElementById('reservation-form');
    const dateInput = document.getElementById('res-date');
    const timeInput = document.getElementById('res-time');
    
    if (!form || !dateInput) return;

    // Set minimum date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    
    // Seed with a valid default (tomorrow) for instant usable state
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tm_yyyy = tomorrow.getFullYear();
    const tm_mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tm_dd = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.value = `${tm_yyyy}-${tm_mm}-${tm_dd}`;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('res-name').value;
        const date = document.getElementById('res-date').value;
        const time = document.getElementById('res-time').value;
        const guests = document.getElementById('res-guests').value;
        
        // Basic validation
        if (!name || !date || !time) {
            alert('Please complete all fields to secure your passage.');
            return;
        }

        // Simulate API call and success UI
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Securing...';
        submitBtn.disabled = true;

        setTimeout(() => {
            showSuccessMessage({ name, date, time, guests });
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            form.reset();
            // Reset to tomorrow
            dateInput.value = `${tm_yyyy}-${tm_mm}-${tm_dd}`;
        }, 1200);
    });
}

function showSuccessMessage(details) {
    const container = document.querySelector('.form-container');
    
    // Check if success panel already exists
    let successPanel = container.querySelector('.booking-success');
    
    if (!successPanel) {
        successPanel = document.createElement('div');
        successPanel.className = 'booking-success';
        container.appendChild(successPanel);
    }
    
    // Format date string for display
    const dateObj = new Date(details.date + 'T00:00:00'); // Force local tz interpretation
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    successPanel.innerHTML = `
        <div class="success-icon">✦</div>
        <h3>Passage Secured</h3>
        <p>Your journey into culinary dimensions awaits.</p>
        <div class="success-details">
            <p>Guest: <span>${details.name}</span></p>
            <p>Date: <span>${dateStr}</span></p>
            <p>Time: <span>${details.time}</span></p>
            <p>Party: <span>${details.guests}</span></p>
        </div>
        <button class="btn-neumorphic" onclick="closeSuccessMessage()">Acknowledge</button>
    `;
    
    // Trigger reflow
    void successPanel.offsetWidth;
    successPanel.classList.add('show');
}

function closeSuccessMessage() {
    const successPanel = document.querySelector('.booking-success');
    if (successPanel) {
        successPanel.classList.remove('show');
    }
}