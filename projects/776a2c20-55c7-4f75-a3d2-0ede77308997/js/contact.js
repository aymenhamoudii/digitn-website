/* Contact form validation + confirmation modal */
(function(){
  'use strict';
  onReady(function(){
    var form = q('#contact-form');
    if (!form) return;
    var name = q('#name');
    var phone = q('#phone');
    var date = q('#date');
    var message = q('#message');
    var errName = q('#error-name');
    var errPhone = q('#error-phone');
    var errForm = q('#error-form');

    function clearErrors(){ errName.textContent=''; errPhone.textContent=''; errForm.textContent=''; }

    function validate(){
      clearErrors();
      var valid = true;
      if (!name.value || name.value.trim().length < 2){ errName.textContent = 'Please enter your name.'; valid=false; }
      var phonePattern = new RegExp(phone.getAttribute('pattern'));
      if (!phone.value || !phonePattern.test(phone.value.trim())){ errPhone.textContent = 'Please enter a valid phone number.'; valid=false; }
      return valid;
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!validate()){
        errForm.textContent = 'Please fix errors above.'; return;
      }
      // Simulate success and show confirmation modal
      showConfirmation();
      form.reset();
    });

    q('#clear-form').addEventListener('click', function(){ form.reset(); clearErrors(); name.focus(); });

    // Confirmation modal (re-usable alert pattern)
    function showConfirmation(){
      var modal = document.createElement('div');
      modal.className = 'confirm-modal';
      modal.setAttribute('role','alertdialog');
      modal.setAttribute('aria-live','polite');
      modal.innerHTML = '<div class="confirm-inner"><h3>Request received</h3><p>Thanks — we will call to confirm your reservation shortly. Prefer an immediate booking? Call us at <a href="tel:+15551234567">(555) 123-4567</a>.</p><div class="confirm-actions"><button class="btn btn-primary confirm-ok">OK</button></div></div>';
      document.body.appendChild(modal);
      var ok = modal.querySelector('.confirm-ok');
      ok.focus();
      ok.addEventListener('click', function(){ modal.parentNode.removeChild(modal); });
    }
  });
})();
