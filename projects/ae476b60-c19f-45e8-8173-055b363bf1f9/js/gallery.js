/* Gallery rendering and lightbox */
function renderGallery(){
  const strip=qs('#galleryStrip');
  if(!strip) return; // safety guard
  const images=JSON.parse(localStorage.getItem('galleryImages')||'[]');
  strip.innerHTML='';
  images.forEach((img,i)=>{
    if(!img || !img.url) return; // skip invalid entries
    const div=document.createElement('div');
    div.className='gallery-item';
    div.dataset.idx=i;
    div.innerHTML=`<img src="${img.url}" alt="${img.caption || ''}">`;
    strip.appendChild(div);
  });
  // attach click listeners for lightbox
  qsa('.gallery-item').forEach(el=>{
    el.addEventListener('click',()=>openLightbox(parseInt(el.dataset.idx)));
  });
}
function openLightbox(idx){
  const imgs=JSON.parse(localStorage.getItem('galleryImages')||'[]');
  if(!imgs.length || idx===undefined || idx<0 || idx>=imgs.length){
    // no images or invalid index – abort safely
    return;
  }
  const lightbox=qs('#lightbox');
  const imgEl=qs('#lightboxImg');
  imgEl.src=imgs[idx].url;
  imgEl.alt=imgs[idx].caption || '';
  lightbox.hidden=false;
  // store current index
  lightbox.dataset.current=idx;
}
function closeLightbox(){qs('#lightbox').hidden=true;}
function navigateLightbox(dir){
  const imgs=JSON.parse(localStorage.getItem('galleryImages')||'[]');
  if(!imgs.length) return; // nothing to navigate
  const lightbox=qs('#lightbox');
  let idx=parseInt(lightbox.dataset.current);
  if(isNaN(idx)) return; // safety guard
  idx=(idx+dir+imgs.length)%imgs.length;
  openLightbox(idx);
}
// Lightbox controls
function initLightbox(){
  const closeBtn=qs('.lightbox-close');
  const prevBtn=qs('.lightbox-prev');
  const nextBtn=qs('.lightbox-next');
  if(closeBtn) closeBtn.addEventListener('click',closeLightbox);
  if(prevBtn) prevBtn.addEventListener('click',()=>navigateLightbox(-1));
  if(nextBtn) nextBtn.addEventListener('click',()=>navigateLightbox(1));
  // close on Escape
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox();});
}

document.addEventListener('DOMContentLoaded',()=>{renderGallery();initLightbox();});
