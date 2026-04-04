/* app.js - initialization and reservation form handling */

onReady(function() {
  var form = document.getElementById('reservation-form');
  var saveBtn = document.getElementById('save-draft');
  var status = document.getElementById('form-status');

  // load draft
  var draft = storageGet('fristo_reservation_draft', null);
  if (draft && form) {
    Object.keys(draft).forEach(function(k) {
      var el = form.querySelector('[name="' + k + '"]');
      if (el) el.value = draft[k];
    });
    if (status) setText(status, 'Loaded saved draft.');
    setTimeout(function(){ if (status) setText(status,''); }, 2500);
  }

  function gatherForm() {
    var data = {};
    ['name','email','phone','date','time','party','notes'].forEach(function(k){
      var el = form.querySelector('[name="' + k + '"]');
      if (el) data[k] = el.value || '';
    });
    return data;
  }

  function validateForm(data) {
    if (!data.name || data.name.trim().length < 2) return 'Please enter your full name.';
    if (!validateEmail(data.email)) return 'Please enter a valid email address.';
    if (!data.phone || data.phone.trim().length < 7) return 'Please enter a phone number.';
    if (!data.date) return 'Please choose a date.';
    if (!data.time) return 'Please choose a time.';
    if (!data.party || Number(data.party) < 1) return 'Please enter party size.';
    return null;
  }

  if (saveBtn && form) {
    saveBtn.addEventListener('click', function() {
      var data = gatherForm();
      storageSet('fristo_reservation_draft', data);
      setText(status, 'Draft saved locally.');
      setTimeout(function(){ setText(status, ''); }, 2500);
    });
  }

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = gatherForm();
      var err = validateForm(data);
      if (err) {
        setText(status, err);
        status.style.color = 'var(--error)';
        return;
      }
      // Simulate successful submission (no backend)
      storageSet('fristo_reservation_last', {submittedAt: new Date().toISOString(), data: data});
      localStorage.removeItem('fristo_reservation_draft');
      setText(status, 'Reservation request submitted. We will contact you soon.');
      status.style.color = 'var(--success)';
      // reset form after short delay
      setTimeout(function(){ form.reset(); }, 800);
      console.info('Reservation submitted', data);
    });
  }

  // Log interactions for QA (no external analytics)
  document.addEventListener('click', function(e){
    var t = e.target;
    if (t && t.tagName) {
      if (t.matches('.btn') || t.closest('.btn')) {
        console.info('UI Click', t.textContent && t.textContent.trim().slice(0,40));
      }
    }
  });

});
