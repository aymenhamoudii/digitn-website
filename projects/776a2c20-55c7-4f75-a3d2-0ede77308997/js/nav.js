/* Navigation behaviors — accessible hamburger + focus trap */
(function(){
  'use strict';
  onReady(function(){
    var btn = q('.nav-toggle');
    var nav = q('#primary-nav');
    var focusableSelectors = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
    var firstFocus = null, lastFocus = null, previouslyFocused = null;

    function openNav(){
      previouslyFocused = document.activeElement;
      btn.setAttribute('aria-expanded','true');
      nav.style.display = 'block';
      nav.classList.add('open');
      nav.setAttribute('aria-hidden','false');
      var focusables = qa(focusableSelectors, nav);
      if (focusables.length){ firstFocus = focusables[0]; lastFocus = focusables[focusables.length-1]; firstFocus.focus(); }
      document.addEventListener('keydown', trapTab);
      document.addEventListener('click', outsideClick);
    }

    function closeNav(){
      btn.setAttribute('aria-expanded','false');
      nav.classList.remove('open');
      nav.setAttribute('aria-hidden','true');
      nav.style.display = '';
      document.removeEventListener('keydown', trapTab);
      document.removeEventListener('click', outsideClick);
      if (previouslyFocused) previouslyFocused.focus();
    }

    function trapTab(e){
      if (e.key === 'Escape') { closeNav(); }
      if (e.key !== 'Tab') return;
      if (!firstFocus || !lastFocus) return;
      if (e.shiftKey && document.activeElement === firstFocus){ e.preventDefault(); lastFocus.focus(); }
      else if (!e.shiftKey && document.activeElement === lastFocus){ e.preventDefault(); firstFocus.focus(); }
    }

    function outsideClick(e){
      if (!nav.contains(e.target) && e.target !== btn){ closeNav(); }
    }

    btn.addEventListener('click', function(){
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) closeNav(); else openNav();
    });

    // Progressive disclosure for small screens: hide lesser items under "More"
    function addMoreControl(){
      var ul = q('#primary-nav ul');
      if (!ul) return;
      var items = qa('#primary-nav ul > li');
      if (window.innerWidth < 640 && items.length > 4 && !q('.more-toggle')){
        var moreLi = document.createElement('li');
        var btnMore = document.createElement('button');
        btnMore.className = 'more-toggle';
        btnMore.type = 'button';
        btnMore.innerText = 'More';
        btnMore.setAttribute('aria-expanded','false');
        var extraMenu = document.createElement('ul');
        extraMenu.className = 'extra-menu';
        // move last items into extra
        for (var i=items.length-1;i>=3;i--){
          extraMenu.appendChild(items[i]);
        }
        moreLi.appendChild(btnMore);
        moreLi.appendChild(extraMenu);
        ul.appendChild(moreLi);

        btnMore.addEventListener('click', function(){
          var exp = this.getAttribute('aria-expanded') === 'true';
          this.setAttribute('aria-expanded', String(!exp));
          extraMenu.style.display = exp ? 'none' : 'block';
        });
      }
    }

    addMoreControl();
    window.addEventListener('resize', debounce(function(){ addMoreControl(); },150));
  });
})();
