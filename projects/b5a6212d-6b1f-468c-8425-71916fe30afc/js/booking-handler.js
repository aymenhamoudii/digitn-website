document.addEventListener('DOMContentLoaded', function() {
  const reservationForm = document.getElementById('reservation-form');
  const successOverlay = document.getElementById('booking-success');

  if (!reservationForm) return;

  reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect data
    const formData = new FormData(reservationForm);
    const data = Object.fromEntries(formData.entries());

    // Basic Validation
    if (!data.name || !data.email || !data.date || !data.time) {
      showFeedback('Please fill in all required fields.', 'error');
      return;
    }

    // Simulate API Call
    reservationForm.classList.add('submitting');
    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    setTimeout(() => {
      // Mock Success
      reservationForm.classList.remove('submitting');
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;

      // Show Success State
      successOverlay.classList.add('active');
      reservationForm.reset();

      // Clear success overlay after 10 seconds or manual click
      document.querySelector('.success-close').addEventListener('click', () => {
        successOverlay.classList.remove('active');
      });
    }, 2000);
  });

  function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `form-feedback feedback-${type}`;
    feedback.textContent = message;
    
    // Custom styles added inline for feedback
    Object.assign(feedback.style, {
      padding: 'var(--space-4)',
      marginTop: 'var(--space-4)',
      fontSize: 'var(--text-sm)',
      border: '1px solid ' + (type === 'error' ? 'var(--gold-muted)' : 'var(--gold-primary)'),
      color: type === 'error' ? 'var(--gold-accent)' : 'var(--text-primary)',
      backgroundColor: 'rgba(0,0,0,0.3)',
      animation: 'fadeInSimple 0.4s ease'
    });

    reservationForm.appendChild(feedback);
    setTimeout(() => feedback.remove(), 5000);
  }
});
