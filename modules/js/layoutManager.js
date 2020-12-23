var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var debug = isDebug ? console.info.bind(window.console) : function () { };

define(["dojo", "dojo/_base/declare",
  g_gamethemeurl + "modules/js/vendor/nouislider.min.js",
], function (dojo, declare, noUiSlider) {
  var jstpl_currentPlayerBoard = `
  <div class="concept-current-player-board">
    <div id="layout-settings">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        <g>
          <path class="fa-secondary" fill="currentColor" d="M638.41 387a12.34 12.34 0 0 0-12.2-10.3h-16.5a86.33 86.33 0 0 0-15.9-27.4L602 335a12.42 12.42 0 0 0-2.8-15.7 110.5 110.5 0 0 0-32.1-18.6 12.36 12.36 0 0 0-15.1 5.4l-8.2 14.3a88.86 88.86 0 0 0-31.7 0l-8.2-14.3a12.36 12.36 0 0 0-15.1-5.4 111.83 111.83 0 0 0-32.1 18.6 12.3 12.3 0 0 0-2.8 15.7l8.2 14.3a86.33 86.33 0 0 0-15.9 27.4h-16.5a12.43 12.43 0 0 0-12.2 10.4 112.66 112.66 0 0 0 0 37.1 12.34 12.34 0 0 0 12.2 10.3h16.5a86.33 86.33 0 0 0 15.9 27.4l-8.2 14.3a12.42 12.42 0 0 0 2.8 15.7 110.5 110.5 0 0 0 32.1 18.6 12.36 12.36 0 0 0 15.1-5.4l8.2-14.3a88.86 88.86 0 0 0 31.7 0l8.2 14.3a12.36 12.36 0 0 0 15.1 5.4 111.83 111.83 0 0 0 32.1-18.6 12.3 12.3 0 0 0 2.8-15.7l-8.2-14.3a86.33 86.33 0 0 0 15.9-27.4h16.5a12.43 12.43 0 0 0 12.2-10.4 112.66 112.66 0 0 0 .01-37.1zm-136.8 44.9c-29.6-38.5 14.3-82.4 52.8-52.8 29.59 38.49-14.3 82.39-52.8 52.79zm136.8-343.8a12.34 12.34 0 0 0-12.2-10.3h-16.5a86.33 86.33 0 0 0-15.9-27.4l8.2-14.3a12.42 12.42 0 0 0-2.8-15.7 110.5 110.5 0 0 0-32.1-18.6A12.36 12.36 0 0 0 552 7.19l-8.2 14.3a88.86 88.86 0 0 0-31.7 0l-8.2-14.3a12.36 12.36 0 0 0-15.1-5.4 111.83 111.83 0 0 0-32.1 18.6 12.3 12.3 0 0 0-2.8 15.7l8.2 14.3a86.33 86.33 0 0 0-15.9 27.4h-16.5a12.43 12.43 0 0 0-12.2 10.4 112.66 112.66 0 0 0 0 37.1 12.34 12.34 0 0 0 12.2 10.3h16.5a86.33 86.33 0 0 0 15.9 27.4l-8.2 14.3a12.42 12.42 0 0 0 2.8 15.7 110.5 110.5 0 0 0 32.1 18.6 12.36 12.36 0 0 0 15.1-5.4l8.2-14.3a88.86 88.86 0 0 0 31.7 0l8.2 14.3a12.36 12.36 0 0 0 15.1 5.4 111.83 111.83 0 0 0 32.1-18.6 12.3 12.3 0 0 0 2.8-15.7l-8.2-14.3a86.33 86.33 0 0 0 15.9-27.4h16.5a12.43 12.43 0 0 0 12.2-10.4 112.66 112.66 0 0 0 .01-37.1zm-136.8 45c-29.6-38.5 14.3-82.5 52.8-52.8 29.59 38.49-14.3 82.39-52.8 52.79z" opacity="0.4"></path>
          <path class="fa-primary" fill="currentColor" d="M420 303.79L386.31 287a173.78 173.78 0 0 0 0-63.5l33.7-16.8c10.1-5.9 14-18.2 10-29.1-8.9-24.2-25.9-46.4-42.1-65.8a23.93 23.93 0 0 0-30.3-5.3l-29.1 16.8a173.66 173.66 0 0 0-54.9-31.7V58a24 24 0 0 0-20-23.6 228.06 228.06 0 0 0-76 .1A23.82 23.82 0 0 0 158 58v33.7a171.78 171.78 0 0 0-54.9 31.7L74 106.59a23.91 23.91 0 0 0-30.3 5.3c-16.2 19.4-33.3 41.6-42.2 65.8a23.84 23.84 0 0 0 10.5 29l33.3 16.9a173.24 173.24 0 0 0 0 63.4L12 303.79a24.13 24.13 0 0 0-10.5 29.1c8.9 24.1 26 46.3 42.2 65.7a23.93 23.93 0 0 0 30.3 5.3l29.1-16.7a173.66 173.66 0 0 0 54.9 31.7v33.6a24 24 0 0 0 20 23.6 224.88 224.88 0 0 0 75.9 0 23.93 23.93 0 0 0 19.7-23.6v-33.6a171.78 171.78 0 0 0 54.9-31.7l29.1 16.8a23.91 23.91 0 0 0 30.3-5.3c16.2-19.4 33.7-41.6 42.6-65.8a24 24 0 0 0-10.5-29.1zm-151.3 4.3c-77 59.2-164.9-28.7-105.7-105.7 77-59.2 164.91 28.7 105.71 105.7z"></path>
        </g>
      </svg>
    </div>
  </div>
  <div class='layoutControlsHidden' id="layout-controls-container">
      <div id="layout-control-ratio-range"></div>

      <div class="bgabutton bgabutton_blue" id="layout-reset" style="display:none">\${reset}</div>
  </div>
  `;


  return declare("concept.layout", null, {
/*********************************
********* Layout Manager *********
*********************************/
    constructor() {
      debug("Seting up the layout manager");
      this._isSnapped = true;

      this._ratio = this.getConfig('conceptRatio', 100);
    },

    reset(){
      this._ratioSlider.noUiSlider.set(100);
      this.setRatio(100);
    },

    init(isSnapped, pId){
      var iconsElt = this.format_block(jstpl_currentPlayerBoard, {
        "reset" : _("Reset"),
      });

      if(pId != null){
        dojo.place(iconsElt, "player_board_" + pId);
      } else {
        dojo.place(iconsElt, document.querySelector(".player-board.spectator-mode"));
        dojo.query(".player-board.spectator-mode .roundedbox_main").style("display", "none");
      }


      dojo.connect($('layout-settings'), 'onclick', () => this.toggleControls() );
      dojo.connect($('layout-reset'), 'onclick', () => this.reset() );

      this._isSnapped = isSnapped;

      /*
       * Double slider to choose the ratios
       */
      this._ratioSlider = document.getElementById('layout-control-ratio-range');
      noUiSlider.create(this._ratioSlider, {
        start: this._ratio,
        step:1,
        padding:5,
        range: {
          'min': [0],
          'max': [105]
        },
      });
      this._ratioSlider.noUiSlider.on('slide', (arg) => this.setRatio(parseInt(arg[0])) );
    },

    toggleControls(){
      dojo.toggleClass('layout-controls-container', 'layoutControlsHidden')

      // Hacking BGA framework
      if(dojo.hasClass("ebd-body", "mobile_version")){
        dojo.query(".player-board").forEach(elt => {
          if(elt.style.height != "auto"){
            dojo.style(elt, "min-height", elt.style.height);
            elt.style.height = "auto";
          }
        });
      }
    },


    getConfig(value, v){
      return localStorage.getItem(value) == null? v : localStorage.getItem(value);
    },

    setRatio(a){
      this._ratio = a;
      localStorage.setItem("conceptRatio", a);
      this.onScreenWidthChange();
    },


    onScreenWidthChange(){
      dojo.style('page-content', 'zoom', '');
      dojo.style('page-title', 'zoom', '');
      dojo.style('right-side-first-part', 'zoom', '');

      let gridWidth = this._isSnapped? 1100 : 1280;
      let gridHeight = 800;
      let box = $('concept-grid-container').getBoundingClientRect();


      let scale =  this._ratio / 100 * box['width'] / gridWidth; //Math.min(box['width'] / gridWidth, box['height'] / gridHeight);
      dojo.style("concept-grid-fixed-width", "transform", `scale(${scale})`);

      dojo.style('concept-grid-fixed-width-container', 'width',  gridWidth * scale + "px");
      dojo.style('concept-grid-fixed-width-container', 'height', gridHeight * scale + "px");



      var guesses = $('concept-guesses').getBoundingClientRect();
      dojo.style('concept-guesses', 'maxHeight', 'calc(100vh - ' + (guesses.y + 10) + 'px)');

      if($("hints")){
        var hints = $('hints').getBoundingClientRect();
        dojo.style('hints', 'maxHeight', 'calc(100vh - ' + (hints.y + 10) + 'px)');
      }
    },

    format_block(_a1f, args) {
      return dojo.trim(dojo.string.substitute(_a1f, args));
    },
  });
});
