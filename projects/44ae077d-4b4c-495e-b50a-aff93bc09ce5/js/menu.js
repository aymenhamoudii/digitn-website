/* Menu rendering and filtering - reads window.MENU_DATA */
(function(){
  function renderFilters(container, data){
    var categories = Array.from(new Set(data.map(function(i){return i.category})));
    var frag = document.createDocumentFragment();
    categories.forEach(function(cat, idx){
      var btn = createEl('button',{class:'menu-filter-btn', role:'button', 'aria-pressed': idx===0 ? 'true' : 'false', 'data-cat':cat, 'type':'button'}, [cat]);
      btn.addEventListener('click', function(){
        var pressed = btn.getAttribute('aria-pressed') === 'true';
        Array.prototype.forEach.call(container.querySelectorAll('.menu-filter-btn'), function(b){ b.setAttribute('aria-pressed','false'); });
        btn.setAttribute('aria-pressed','true');
        applyFilters();
      });
      frag.appendChild(btn);
    });
    var search = createEl('div',{class:'menu-search'}, [createEl('input',{type:'search',placeholder:'Search menu...', id:'menu-search','aria-label':'Search menu'})]);
    frag.appendChild(search);
    container.appendChild(frag);

    // search debounce
    var input = search.querySelector('input');
    input.addEventListener('input', debounce(applyFilters, 250));
  }

  function renderMenu(container, data){
    container.innerHTML = '';
    var list = createEl('div',{class:'menu-grid'});
    data.forEach(function(item){
      var card = createEl('article',{class:'menu-item', 'data-id':item.id, itemscope:'', itemtype:'http://schema.org/MenuItem'});
      var thumb = createEl('div',{class:'thumb'}, [createEl('img',{src: item.thumb || 'assets/images/placeholder.jpg', alt: item.name})]);
      var meta = createEl('div',{class:'meta'});
      var titleRow = createEl('div',{class:'title-row'}, [createEl('h4',{text:item.name, itemprop:'name'}), createEl('div',{class:'price', text: formatCurrency(item.price)})]);
      var desc = createEl('p',{class:'desc', text:item.description, itemprop:'description'});
      var tagsWrap = createEl('div',{class:'diet-tags'});
      (item.tags||[]).forEach(function(t){ tagsWrap.appendChild(createEl('span',{class:'diet-tag', text:t})); });
      var actions = createEl('div',{class:'actions'}, [createEl('button',{class:'btn btn-ghost', 'type':'button', 'data-reserve':item.id, 'aria-label':'Reserve ' + item.name}, ['Reserve'])]);
      meta.appendChild(titleRow); meta.appendChild(desc); meta.appendChild(tagsWrap); meta.appendChild(actions);
      card.appendChild(thumb); card.appendChild(meta);
      list.appendChild(card);
    });
    container.appendChild(list);

    // Hook reserve buttons
    container.querySelectorAll('[data-reserve]').forEach(function(b){
      b.addEventListener('click', function(e){
        var id = b.getAttribute('data-reserve');
        document.querySelector('#reservations a.btn-primary').focus();
        var el = document.getElementById('res-notes');
        if(el) el.value = 'Table for ' + id + ' (from menu)';
        location.hash = '#reservations';
      });
    });
  }

  function applyFilters(){
    var active = document.querySelector('.menu-filter-btn[aria-pressed="true"]');
    var query = (document.getElementById('menu-search') || {value:''}).value.trim().toLowerCase();
    var cat = active ? active.getAttribute('data-cat') : null;
    var filtered = window.MENU_DATA.filter(function(i){
      var matchCat = !cat || i.category === cat;
      var matchQuery = !query || (i.name + ' ' + i.description + ' ' + (i.tags||[]).join(' ')).toLowerCase().indexOf(query) !== -1;
      return matchCat && matchQuery;
    });
    var container = document.getElementById('menu-list');
    renderMenu(container, filtered);
  }

  ready(function(){
    var filters = document.getElementById('menu-filters');
    if(!filters) return;
    renderFilters(filters, window.MENU_DATA);
    applyFilters();
  });
})();
