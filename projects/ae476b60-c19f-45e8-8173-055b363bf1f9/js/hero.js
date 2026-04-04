/* Hero interactions */
document.addEventListener('DOMContentLoaded',function(){
  const hero=document.getElementById('hero');
  const btn=qs('#reserveBtn');
  // smooth scroll to reservation section on click
  btn.addEventListener('click',function(){
    qs('#reservationSection').scrollIntoView({behavior:'smooth'});
  });
  // optional fade-in effect on load
  hero.style.opacity=0;
  setTimeout(()=>{hero.style.transition='opacity 0.8s ease';hero.style.opacity=1;},100);
});
