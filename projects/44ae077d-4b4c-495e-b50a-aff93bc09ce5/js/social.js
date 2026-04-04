/* Social feed integration and graceful fallback */
(function(){
  function renderSocial(container){
    container.innerHTML = '';
    // Try to inject common embed markup; if blocked, fallback to cached posts
    try{
      // For demonstration, show embed placeholders
      var wrapper = createEl('div',{class:'social-embeds'});
      var ig = createEl('div',{class:'embed', 'aria-hidden':'true'}, [createEl('p',{text:'Instagram feed would appear here.'})]);
      wrapper.appendChild(ig);
      container.appendChild(wrapper);
      // Also provide accessible fallback list
      var list = createEl('ul',{class:'social-list'});
      (window.SOCIAL_FEED||[]).forEach(function(p){
        var li = createEl('li',{});
        li.appendChild(createEl('strong',{text:p.author + ': '}));
        li.appendChild(createEl('span',{text:p.text}));
        list.appendChild(li);
      });
      container.appendChild(list);
    }catch(e){
      // Fallback
      var list = createEl('ul',{class:'social-list'});
      (window.SOCIAL_FEED||[]).forEach(function(p){
        var li = createEl('li',{});
        li.appendChild(createEl('strong',{text:p.author + ': '}));
        li.appendChild(createEl('span',{text:p.text}));
        list.appendChild(li);
      });
      container.appendChild(list);
    }
  }

  ready(function(){
    var container = document.getElementById('social-feed');
    if(container) renderSocial(container);
  });
})();
