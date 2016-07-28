import PIXI from 'pixi.js'

(function(){
  function ready(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function(){
    console.log('hello world')
    console.log(PIXI)
  })

})()
