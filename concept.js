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

 define([
   "dojo",
   "dojo/_base/declare",
   "ebg/core/gamegui",
   "ebg/counter",
   g_gamethemeurl + "modules/js/vue.js",
   g_gamethemeurl + "modules/js/popper.min.js",
   g_gamethemeurl + "modules/js/sortable.js",
   g_gamethemeurl + "modules/js/vuedraggable.js",
   g_gamethemeurl + "modules/js/symbols.js",
   g_gamethemeurl + "modules/js/vue-concept.js",
   g_gamethemeurl + "modules/js/vue-concept-free.js",
   g_gamethemeurl + "modules/js/vue-concept-snapped.js",
 ], function (dojo, declare) {
 	return declare("bgagame.concept", ebg.core.gamegui, {
    constructor: function () {
      this.default_viewport = 'width=900, user-scalable=yes';
      this._app = null;
    },
    setup: function (gamedatas) {
      dojo.place("<div id='concept-topbar'></div>", 'topbar', 'after');
      this._app = gamedatas.mode == "free"? new Vue(ConceptFree(this)) : new Vue(ConceptSnapped(this));
      this.initPreferencesObserver();
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
    onPreferenceChange: function(pref, newValue){
      this._app.onPreferenceChange(pref, newValue);
    },


    onScreenWidthChange: function () {
      dojo.style('page-content', 'zoom', '');
      dojo.style('page-title', 'zoom', '');
      dojo.style('right-side-first-part', 'zoom', '');
      if(this._app)
        this._app.onScreenWidthChange();
    },


    /*
     * Preference polyfill
     */
    setPreferenceValue: function(number, newValue) {
			var optionSel = 'option[value="' + newValue + '"]'
			dojo.query('#preference_control_' + number + ' > ' +	optionSel
        +	', #preference_fontrol_' +number + ' > ' +	optionSel)
				.attr('selected', true)
			var select = $('preference_control_' + number)
			if (dojo.isIE) {
				select.fireEvent('onchange')
			} else {
				var event = document.createEvent('HTMLEvents')
				event.initEvent('change', false, true)
				select.dispatchEvent(event)
			}
		},

		initPreferencesObserver: function() {
			dojo.query('.preference_control').on(
				'change',
				dojo.hitch(this, function(e) {
					var match = e.target.id.match(/^preference_control_(\d+)$/)
					if (!match) {
						return
					}
					var pref = match[1]
					var newValue = e.target.value
					this.prefs[pref].value = newValue
					this.onPreferenceChange(pref, newValue)
				})
			)
		},
  });
});
