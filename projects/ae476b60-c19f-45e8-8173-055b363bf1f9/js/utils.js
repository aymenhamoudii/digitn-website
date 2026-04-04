/* Utility helpers – global scope */
function qs(selector, scope=document) {return scope.querySelector(selector);}
function qsa(selector, scope=document) {return Array.from(scope.querySelectorAll(selector));}
function addClass(el, cls) {if (el && !el.classList.contains(cls)) el.classList.add(cls);}
function removeClass(el, cls) {if (el && el.classList.contains(cls)) el.classList.remove(cls);}
function toggleDarkMode(){const root=document.documentElement;root.classList.toggle('dark');}
/* Expose utilities globally */
window.qs=qs;window.qsa=qsa;window.addClass=addClass;window.removeClass=removeClass;window.toggleDarkMode=toggleDarkMode;
