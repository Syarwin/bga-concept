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
  });
});
