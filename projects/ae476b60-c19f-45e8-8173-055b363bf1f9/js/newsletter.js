/* Newsletter subscription handling */
function showMessage(msg,success){
  const p=qs('#newsletterMessage');
  p.textContent=msg;
  p.style.color=success? 'var(--accent)' : 'var(--error)';
}
function handleNewsletter(e){
  e.preventDefault();
  const email=qs('#newsletterEmail').value.trim();
  const re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!re.test(email)){
    showMessage('Please enter a valid email.',false);
    return;
  }
  // Demo: store in localStorage list
  const list=JSON.parse(localStorage.getItem('newsletterList')||'[]');
  if(!list.includes(email)) list.push(email);
  localStorage.setItem('newsletterList',JSON.stringify(list));
  showMessage('Subscribed! Thank you.',true);
  qs('#newsletterForm').reset();
}

document.addEventListener('DOMContentLoaded',()=>{qs('#newsletterForm').addEventListener('submit',handleNewsletter);});
