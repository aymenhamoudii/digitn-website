document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (nameInput.value && emailInput.value && messageInput.value) {
            alert('Message sent!');
            form.reset();
        } else {
            alert('Please fill out all fields.');
        }
    });
});
