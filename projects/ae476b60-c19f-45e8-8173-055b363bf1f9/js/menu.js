/* Menu data rendering and carousel controls */
function renderMenu(){
  const container=qs('#menuContainer');
  const items=JSON.parse(localStorage.getItem('menuItems')||'[]');
  container.innerHTML='';
  items.forEach(item=>{
    const card=document.createElement('div');
    card.className='menu-item';
    card.innerHTML=`
      <img src="${item.image}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="price">$${item.price.toFixed(2)}</div>
    `;
    container.appendChild(card);
  });
  // show carousel controls on mobile only
  const controls=qs('#menuControls');
  if(window.innerWidth<640){controls.removeAttribute('hidden');}
  else{controls.setAttribute('hidden','');}
}
function initMenuCarousel(){
  const prev=qs('#prevMenu');
  const next=qs('#nextMenu');
  const container=qs('#menuContainer');
  const scrollAmount=container.offsetWidth*0.8;
  prev.addEventListener('click',()=>{container.scrollBy({left:-scrollAmount,behavior:'smooth'});});
  next.addEventListener('click',()=>{container.scrollBy({left:scrollAmount,behavior:'smooth'});});
}
document.addEventListener('DOMContentLoaded',()=>{renderMenu();initMenuCarousel();});
