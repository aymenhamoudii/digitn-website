document.addEventListener('DOMContentLoaded', function() {
    const reservationForm = document.getElementById('reservation-form');

    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(reservationForm);
        const data = Object.fromEntries(formData.entries());
        console.log('Reservation Data:', data);
        alert('Reservation submitted!');
    });
});