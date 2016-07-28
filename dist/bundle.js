/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _pixi = __webpack_require__(1);
	
	var _pixi2 = _interopRequireDefault(_pixi);
	
	var _utilities = __webpack_require__(2);
	
	var util = _interopRequireWildcard(_utilities);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	util.ready(function () {
	
	    // You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
	    // which will try to choose the best renderer for the environment you are in.
	    var renderer = new _pixi2.default.WebGLRenderer(800, 600);
	
	    // The renderer will create a canvas element for you that you can then insert into the DOM.
	    document.body.appendChild(renderer.view);
	
	    // You need to create a root container that will hold the scene you want to draw.
	    var stage = new _pixi2.default.Container();
	
	    // Declare a global variable for our sprite so that the animate function can access it.
	    var zelda = null;
	
	    // load the texture we need
	    _pixi2.default.loader.add('zelda', './assets/img/zelda.png').load(function (loader, resources) {
	        // This creates a texture from a 'zelda.png' image.
	        zelda = new _pixi2.default.Sprite(resources.zelda.texture);
	
	        // Setup the position and scale of the zelda
	        zelda.position.x = 400;
	        zelda.position.y = 300;
	
	        zelda.scale.x = 2;
	        zelda.scale.y = 2;
	
	        // Add the zelda to the scene we are building.
	        stage.addChild(zelda);
	
	        // kick off the animation loop (defined below)
	        animate();
	    });
	
	    function animate() {
	        // start the timer for the next animation loop
	        requestAnimationFrame(animate);
	
	        // each frame we spin the zelda around a bit
	        zelda.rotation += 0.01;
	
	        // this is the main render call that makes pixi draw your container and its children.
	        renderer.render(stage);
	    }
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = pixi.js;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var ready = exports.ready = function ready(fn) {
	  if (document.readyState != 'loading') {
	    fn();
	  } else {
	    document.addEventListener('DOMContentLoaded', fn);
	  }
	};

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map