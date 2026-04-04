/* Global helpers for DIGITN-built site — no modules, global scope */
(function(){
  'use strict';

  window.q = function(sel, ctx){ return (ctx || document).querySelector(sel); };
  window.qa = function(sel, ctx){ return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  window.debounce = function(fn, wait){
    var t;
    return function(){
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function(){ fn.apply(ctx, args); }, wait);
    };
  };

  window.throttle = function(fn, limit){
    var last, deferTimer;
    return function(){
      var now = Date.now(), args = arguments, ctx = this;
      if (last && now < last + limit){
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function(){ last = now; fn.apply(ctx,args); }, limit);
      } else {
        last = now; fn.apply(ctx,args);
      }
    };
  };

  window.onReady = function(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  };

})();
