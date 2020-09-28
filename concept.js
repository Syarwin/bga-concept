/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Concept implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * concept.js
 *
 * Concept user interface script
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */
 const DARK_MODE = 100;
 const DARK_MODE_DISABLED = 1;
 const DARK_MODE_ENABLED = 2;


 var isDebug = true;
 var debug = isDebug ? console.info.bind(window.console) : function () { };
 define([
   "dojo",
   "dojo/_base/declare",
   "ebg/core/gamegui",
   "ebg/counter",
   g_gamethemeurl + "modules/script/popper.min.js",
   g_gamethemeurl + "modules/script/symbols.js",
   g_gamethemeurl + "modules/script/vue.js",
   g_gamethemeurl + "modules/script/vue-concept.js"
 ], function (dojo, declare) {
 	return declare("bgagame.concept", ebg.core.gamegui, {
    constructor: function () {
      this._app = null;
    },
    name: function(){
      return 'concept';
    },
    setup: function (gamedatas) {
      this._app = new Vue(Concept(this));
      this.setupPreference();
    },
    onEnteringState: function (stateName, args) {
      this._app.onEnteringState(stateName, args);
    },
    onLeavingState: function (stateName) {
      this._app.onLeavingState(stateName);
    },
    onUpdateActionButtons: function (stateName, args) {
      this._app.onUpdateActionButtons(stateName, args);
    },

    setupPreference: function () {
      var updatePreference = (e) => {
        var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/)
        if (!match) {
          return;
        }
        var pref = +match[1];
        var prefValue = +e.target.value;
        debug('Update preference', pref + ' = ' + prefValue);
        if (pref == DARK_MODE) {
          this._app.toggleDarkMode(prefValue == DARK_MODE_ENABLED);
        }
      };

      dojo.query('.preference_control').connect('onchange', updatePreference);
      updatePreference({ target: $('preference_control_' + DARK_MODE) });
    },
  });
});
