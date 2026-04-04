/* Reservation form validation and toast */
function showToast(message){
  const toast=qs('#toast');
  toast.textContent=message;
  toast.hidden=false;
  setTimeout(()=>{toast.hidden=true;},3000);
}
function validateReservation(data){
  const errors=[];
  if(!data.name.trim()) errors.push('Name required');
  if(!data.phone.trim()) errors.push('Phone required');
  if(!data.date) errors.push('Date required');
  if(data.date && new Date(data.date)<new Date().setHours(0,0,0,0)) errors.push('Date must be in the future');
  if(!data.time) errors.push('Time required');
  if(!data.party||data.party<1) errors.push('Party size required');
  return errors;
}
function handleReservation(e){
  e.preventDefault();
  const data={
    name:qs('#resName').value,
    phone:qs('#resPhone').value,
    date:qs('#resDate').value,
    time:qs('#resTime').value,
    party:parseInt(qs('#resParty').value,10)
  };
  const errors=validateReservation(data);
  if(errors.length){
    showToast(errors.join(', '));
    return;
  }
  // store reservation (demo) in localStorage
  const reservations=JSON.parse(localStorage.getItem('reservations')||'[]');
  reservations.push(data);
  localStorage.setItem('reservations',JSON.stringify(reservations));
  showToast('Reservation submitted!');
  qs('#reservationForm').reset();
}

document.addEventListener('DOMContentLoaded',()=>{qs('#reservationForm').addEventListener('submit',handleReservation);});
