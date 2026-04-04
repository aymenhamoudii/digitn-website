/* Reservations subsystem - client-side validation, storage, export */
(function(){
  var BOOKING_KEY = 'bookings';

  function getBookings(){
    return window.FTP.utils.storageGet(BOOKING_KEY, []);
  }
  function saveBookings(bks){
    return window.FTP.utils.storageSet(BOOKING_KEY, bks);
  }

  function isWithinOpenHours(dateStr, timeStr){
    // Basic check against PAGES.openingHours using day names
    try{
      var d = new Date(dateStr + 'T' + timeStr);
      var day = d.toLocaleString(undefined,{weekday:'long'}).toLowerCase();
      var hours = (window.PAGES && window.PAGES.openingHours && window.PAGES.openingHours[day]) || null;
      if(!hours) return true;
      var parts = hours.split('-');
      var open = parts[0]; var close = parts[1];
      // Compare simple HH:MM strings
      return timeStr >= open && timeStr <= close;
    }catch(e){ return true; }
  }

  function renderBookings(){
    var list = document.getElementById('booking-list');
    list.innerHTML = '';
    var bks = getBookings();
    if(!bks.length){ list.appendChild(createEl('li',{class:'booking-item',text:'No bookings yet.'})); return; }
    bks.forEach(function(b){
      var li = createEl('li',{class:'booking-item'});
      var meta = createEl('div',{class:'meta'}, [createEl('div',{text: b.name + ' — ' + b.party + ' guests'}), createEl('div',{text: formatDateReadable(b.date + 'T' + b.time)})]);
      var status = createEl('div',{class:'status ' + (b.status||'pending'), text: (b.status || 'Pending')});
      li.appendChild(meta); li.appendChild(status);
      list.appendChild(li);
    });
  }

  function exportBookings(){
    var bks = getBookings();
    if(!bks.length) return alert('No bookings to export');
    var csv = 'Name,Email,Phone,Date,Time,Party,Notes,Status\n';
    bks.forEach(function(b){
      csv += '"'+(b.name||'')+'","'+(b.email||'')+'","'+(b.phone||'')+'","'+(b.date||'')+'","'+(b.time||'')+'","'+(b.party||'')+'","'+(b.notes||'')+'","'+(b.status||'')+'"\n';
    });
    var blob = new Blob([csv], {type:'text/csv'});
    var url = URL.createObjectURL(blob);
    var a = createEl('a',{href:url,download:'bookings.csv'});
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function handleFormSubmit(e){
    e.preventDefault();
    var name = document.getElementById('res-name').value.trim();
    var email = document.getElementById('res-email').value.trim();
    var phone = document.getElementById('res-phone').value.trim();
    var date = document.getElementById('res-date').value;
    var time = document.getElementById('res-time').value;
    var party = document.getElementById('res-party').value;
    var notes = document.getElementById('res-notes').value;

    if(!name){ alert('Please enter your full name'); return; }
    if(!validateEmail(email)){ alert('Please enter a valid email'); return; }
    if(!date || !time){ alert('Please select date and time'); return; }
    if(!isWithinOpenHours(date, time)){ alert('Selected time is outside of opening hours'); return; }

    var booking = { id: 'b_' + Date.now(), name: name, email: email, phone: phone, date: date, time: time, party: party, notes: notes, status: 'Pending' };
    var bks = getBookings(); bks.push(booking); saveBookings(bks); renderBookings();

    // Confirmation UI
    var confirm = createEl('div',{class:'card', role:'status'}, [createEl('h4',{text:'Reservation Requested'}), createEl('p',{text: 'Thank you, ' + name + '. Your reservation is pending confirmation.'})]);
    document.getElementById('reservation-form').appendChild(confirm);
    setTimeout(function(){ if(confirm) confirm.remove(); }, 5000);
    document.getElementById('reservation-form').reset();
  }

  ready(function(){
    // Populate opening hours
    var oh = window.PAGES.openingHours || {};
    var el = document.getElementById('opening-hours');
    if(el){
      var dl = createEl('dl');
      Object.keys(oh).forEach(function(k){ dl.appendChild(createEl('div', {class:'hour-row'}, [createEl('dt',{text: k.charAt(0).toUpperCase() + k.slice(1)}), createEl('dd',{text: oh[k]})])); });
      el.appendChild(dl);
    }

    renderBookings();
    var form = document.getElementById('reservation-form');
    if(form) form.addEventListener('submit', handleFormSubmit);
    var exportBtn = document.getElementById('export-bookings');
    if(exportBtn) exportBtn.addEventListener('click', exportBookings);

    // Contact form handling
    var contactForm = document.getElementById('contact-form');
    if(contactForm){
      contactForm.addEventListener('submit', function(ev){
        ev.preventDefault();
        var name = document.getElementById('contact-name').value.trim();
        var email = document.getElementById('contact-email').value.trim();
        var msg = document.getElementById('contact-message').value.trim();
        if(!name || !validateEmail(email) || !msg){ alert('Please complete the form correctly'); return; }
        var messages = window.FTP.utils.storageGet('messages', []);
        messages.push({id:'m_' + Date.now(), name:name, email:email, message:msg, date: new Date().toISOString(), status:'queued'});
        window.FTP.utils.storageSet('messages', messages);
        contactForm.reset();
        var note = createEl('div',{class:'card'}, [createEl('p',{text:'Message queued — we will respond shortly.'})]);
        contactForm.appendChild(note);
        setTimeout(function(){ note.remove(); }, 4000);
      });
    }
  });
})();
