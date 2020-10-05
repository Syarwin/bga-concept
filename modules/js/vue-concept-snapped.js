window.ConceptSnapped = function(game){
  let DARK_MODE = 100;
  let DARK_MODE_DISABLED = 1;
  let DARK_MODE_ENABLED = 2;

  var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
  var debug = isDebug ? console.info.bind(window.console) : function () { };

  return {
    el: '#concept-app',
    components: {
      'draggable' : window.vuedraggable,
    },
    data: {
      // Basic bga stuff
      game: game,
      playerId: game.player_id,
      isSpectator: game.isSpectator,

      // Concept stuff
      isFree:false,
      symbols:ConceptSymbols(),
      hints:game.gamedatas.hints,
      guesses:game.gamedatas.guesses,
      players:game.gamedatas.players,
      team:[],
      displayCard:false,
      card:{},
      displayFeedback:false,
      guessFeedback:null,
      draggedHint:null,
      draggedHintIndex:null,
      dragOffset:null,
      selectedSymbol:null,
      guess:'',
    },
    computed:{
      // BGA stuff
      state: function(){ return this.game.gamedatas.gamestate },
      activePlayerId: function(){ return this.getActivePlayerId() },

      // Concept stuff
      word:function(){
        let w = this.game.gamedatas.word;
        if(w == null) return '';
        else return this.game.gamedatas.cards[w.card][w.i][w.j];
      },

      isClueGiver: function(){
        return this.team.includes(this.playerId);
      },

      dragOptions:function() {
        return {
          animation: 100,
          group: "description",
          disabled: !this.isClueGiver,
          ghostClass: "ghost"
        };
      },


      // Compute the corresponding hints per symbol
  		hintsPerSymbol:function(){
  			var t = [];
  			for(var i = 0; i < this.symbols.length; i++)
  				t[i] = {};

  			for(var j = 0; j < this.hints.length; j++){
  				if(typeof t[this.hints[j].sId][this.hints[j].mId] == "undefined")
  					t[this.hints[j].sId][this.hints[j].mId] = 0;
  				t[this.hints[j].sId][this.hints[j].mId]++;
  			}

  			return t;
  		},


      // Compute a succinct representation of hints using parentId
      organizedHints: function(){
        var t = [];
        for(var i = 1; i < 5; i++)
          t[i] = [];

        var order = [];
        this.hints.forEach(hint => {
          if(!order.includes(hint.mColor))
            order.push(hint.mColor);

          // Already same symbol ?
          var index = t[hint.mColor].reduce( (carry, h, j) => {
            return (hint.mType == h.mType && hint.sId == h.sId)? j : carry;
          }, null)

          if(index != null){
            t[hint.mColor][index].n++;
          } else {
            t[hint.mColor].push({
              id:hint.id,
              mType:hint.mType,
              mColor:hint.mColor,
              sId:hint.sId,
              n:1
            });
          }
        });

        // ALways ?,! first
        for(var i = 1; i < 5; i++)
          t[i].sort(a => b => b.mType - a.mType);

        // Sort the colors
        var res = [];
        for(var i = 0; i < order.length; i++)
          res.push(t[order[i]]);

        return res;
      },
    },


    created: function (){
      debug("SETUP", this.game.gamedatas);

      this.setupNotifications();
    },

    mounted: function(){
      this.symbols.forEach((symbol, id) => {
        this.game.addTooltip("symbol-" + id, symbol.join(", "), '');
      });

      dojo.connect(document, 'onkeydown', (evt) => {
        if(!$("concept-guess")) return;

        if(this.game.chatbarWindows['table_' + this.game.table_id].status == 'expanded') return;
        this.game.collapseChatWindow('table_' + this.game.table_id);
        evt.stopPropagation();
        $("concept-guess").focus();
      });

      if($("concept-guess"))
        $("concept-guess").focus();

      this.addDarkModeSwitch();
    },


    methods:{
      isCurrentPlayerActive: function(){ return this.game.isCurrentPlayerActive() },
      getActivePlayerId: function() { return this.game.getActivePlayerId() },
      getActivePlayers: function() { return this.game.getActivePlayers() },
      addPrimaryActionButton: function(id, msg, callback){ this.game.addActionButton(id, msg, callback, null, false, "blue"); },
      checkAction: function(action) { return this.game.checkAction(action); },
      removeActionButtons: function() { this.game.removeActionButtons(); },
      decode: function(a) { return atob(a); },

      moveHintAt:function(){ },
      dragHintStop: function(){ },

      /*
       * onEnteringState:
       * 	this method is called each time we are entering into a new game state.
       * params:
       *	- str stateName : name of the state we are entering
       *	- mixed args : additional information
       */
      onEnteringState: function(stateName, args){
        debug('Entering state: ' + stateName, args);

        // Stop here if it's not the current player's turn for some states
      	if (["pickWord"].includes(stateName) && !this.isCurrentPlayerActive()) return;

        if(args.args && args.args['team'])
          this.team = args.args['team'].map(o => parseInt(o));

        if(stateName == "addHint" || stateName == "guessWord")
          this.game.gamedatas.word = args.args['_private'];

      	// Call appropriate method
      	var methodName = "onEnteringState" + stateName.charAt(0).toUpperCase() + stateName.slice(1);
      	if (this[methodName] !== undefined)
      		this[methodName](args.args);
      },


      /*
       * onLeavingState:
       * 	this method is called each time we are leaving a game state.
       *
       * params:
       *	- str stateName : name of the state we are leaving
       */
      onLeavingState: function (stateName) {
      	debug('Leaving state: ' + stateName);
      	this.clearPossible();
      },


      /*
       * onUpdateActionButtons:
       * 	called by BGA framework before onEnteringState
       *	in this method you can manage "action buttons" that are displayed in the action status bar (ie: the HTML links in the status bar).
       */
      onUpdateActionButtons: function (stateName, args) {
      	debug('Update action buttons: ' + stateName, args);

      	if (!this.isCurrentPlayerActive()) // Make sure the player is active
      		return;

        if (stateName == "addHint" && !this.game.bRealtime){
          this.addPrimaryActionButton("btnConfirmHints", _("Done"), () => this.confirmHints());
        } else if (stateName == "guessWord" && !this.game.bRealtime){
          this.addPrimaryActionButton("btnPass", _("Pass"), () => this.pass());
        }
      },


      /*
       * takeAction: default AJAX call with locked interface
       */
      takeAction: function (action, data, callback) {
        data = data || {};
        data.lock = true;
        callback = callback || function (res) { };
        var gameName = this.game.game_name;
        this.game.ajaxcall("/" + gameName + "/" + gameName + "/" + action + ".html", data, this, callback);
      },


      ////////////////////////////
      //////	Choose word	 ///////
      ////////////////////////////
      onEnteringStatePickWord: function(args){
        Object.assign(this.card, this.game.gamedatas.cards[args['_private']]);
        this.displayCard = true;
        this.addPrimaryActionButton('buttonShowCard', _('Show card'), () => { this.displayCard = true });
      },


      selectCardWord: function(i,j){
        if(!this.checkAction('pickWord')) return;
        this.takeAction("pickWord", { i : i, j : j});
      },

      ////////////////////////////////////
      ////// Add/move/suppr hints	 ///////
      ////////////////////////////////////
      selectSymbol: function(event, id){
  			if(!this.isClueGiver) return;
  			event.stopPropagation();

  			// Show tooltip
        this.selectedSymbol = id;
  			var target = event.target;
  			if(!target.classList.contains("concept-symbol"))
  				target = target.parentNode;

        setTimeout( () => {
          new Popper(target, document.getElementById("concept-marks-popper"), {
      			placement: (dojo.style(target.firstChild, "order") == 0)? 'left' : 'right',
    			});
        }, 1);
  		},


      // Trigger when clicking outside of symbol
  		unselectSymbol:function(){
  			this.selectedSymbol = null;
  		},


  		// Triggered when a mark is clicked
  		addHint: function(color, type){
        this.takeAction('addHint', {
          mColor : color,
          mType : type,
          sId:this.selectedSymbol,
          x:0,
          y:0,
        });
        this.selectedSymbol = null;
  		},

      removeHint:function(id){
        this.takeAction("deleteHint", { id : id} );
      },

      /*
       * clearHints: clear all the hints of given color
       */
      clearHints: function(mColor){
        this.takeAction("clearHints", {color:mColor});
      },

      /*
       * confirmHints: make the player inactive
       */
      confirmHints: function(){
        this.takeAction("confirmHints", {});
      },


      /*
       * reorderingHints: triggered whenever the clue giver dragndrop the hints
       */
      reorderingHints: function(){
        var order = this.hints.map((hint, index) => {
          return {
            'hId' : hint.id,
            'order' : index,
          };
        });
        this.takeAction("orderHints", { order : JSON.stringify(order) });
      },

      ////////////////////////////////////
      ////// Hints Notifications   ///////
      ////////////////////////////////////
      isMarkUsed: function(color){
        return false;
      },

      notif_addHint: function(n){
        debug("Notif: new hint", n);
        this.hints.push(n.args);
      },

      notif_deleteHint: function(n){
        debug("Notif: remove hint", n);
        var index = this.hints.reduce( (carry, hint, i) => hint.id == n.args.id? i : carry, null);
        if(index != null)
          this.hints.splice(index, 1);
      },


      notif_clearHints: function(n){
        debug("Notif: clearing all hints", n);
        this.hints = [];
      },

      notif_clearColor: function(n){
        debug("Notif: clearing all hints of a color", n);
        this.hints = this.hints.filter(hint => hint.mColor != n.args.color);
      },

      notif_orderHints: function(n){
        debug("Notif: reordering hints", n);
        this.hints = this.hints.reduce((tab, hint) => {
          let newIndex = n.args.order.reduce((carry, h) => h.hId == hint.id? h.order : carry, null);
          tab[newIndex] = hint;
          return tab;
        }, []);
      },
      /////////////////////////
      //////  Guesses   ///////
      /////////////////////////
      newGuess: function(){
        if(this.guess == "") return;

        this.takeAction("newGuess", { guess: btoa(this.guess) });
        this.guess = "";
      },


      notif_newGuess: function(n){
        debug("Notif: new guess", n);
        this.guesses.unshift(n.args);
      },


      /*
       * pass: make the player inactive
       */
      pass: function(){
        this.takeAction("pass", {});
      },


      showFeedbackChoices: function(guess){
        if(guess.pId == -1 || !this.isClueGiver) return;

        this.displayFeedback = true;
        this.guessFeedback = guess;
      },


      wordFound: function(){
        debug("Word found");
        this.takeAction("wordFound", {
          gId: this.guessFeedback.id,
        });
      },



      addFeedback: function(feedback){
        debug("Feeback", feedback);
        this.takeAction("addFeedback", {
          gId: this.guessFeedback.id,
          feedback: feedback
        });
      },


      notif_newFeedback: function(n){
        debug("Notif: new feedback", n);
        this.guesses.forEach(guess => {
          if(guess.id == n.args.gId)
            guess.feedback = n.args.feedback;
        });
      },

      ////////////////////////////////
      ////////////////////////////////
      /////////		Utils		////////////
      ////////////////////////////////
      ////////////////////////////////
      /*
       * clearPossible:	clear every clickable space
       */
      clearPossible: function () {
        debug("Clearing everything");

        this.draggedHint = null;
        this.draggedHintIndex = null;
        this.displayCard = false;
      	this.removeActionButtons();
      	this.onUpdateActionButtons(this.game.gamedatas.gamestate.name, this.game.gamedatas.gamestate.args);
      },


      getHintSize: function(id){
  			var n = Object.keys(this.hintsPerSymbol[id]).length;
  			switch(n){
  				case 1: return 90;
  				case 2: case 3: case 4: return 47;
  				default: return (95 / Math.ceil(Math.sqrt(n)));
  			}
  		},


  		getBadgeSize: function(id){
  			var n = Object.keys(this.hintsPerSymbol[id]).length;
  			switch(n){
  				case 1: return 1;
  				case 2: case 3: case 4: return 0.80;
  				default: return (95 / Math.ceil(Math.sqrt(n)));
  			}
  		},


      /////////////////////////////////////////////
      /////////////	  Preferences 	 /////////////
      ////////////////////////////////////////////
      onPreferenceChange: function(pref, value) {
        if(pref == DARK_MODE)
          this.toggleDarkMode(value == DARK_MODE_ENABLED, false);
		  },

      setPreferenceValue: function(pref, newVal){
        this.game.setPreferenceValue(pref, newVal)
      },

      toggleDarkMode: function(enabled){
        if(enabled){
          dojo.query("html").addClass("darkmode");
          $('chk-darkmode').checked = true;
        } else {
          dojo.query("html").removeClass("darkmode");
          $('chk-darkmode').checked = false;
        }
      },

      addDarkModeSwitch: function(){
        // Darkmode switch
        dojo.place(`
          <div class='upperrightmenu_item' id="darkmode-switch">
            <input type="checkbox" class="checkbox" id="chk-darkmode" />
            <label class="label" for="chk-darkmode">
              <div class="ball"></div>
            </label>
          </div>
          `, 'upperrightmenu', 'first');

        dojo.connect(
          $('chk-darkmode'),
          'onchange',
          () => this.setPreferenceValue(DARK_MODE, $('chk-darkmode').checked? DARK_MODE_ENABLED : DARK_MODE_DISABLED)
        );

        this.toggleDarkMode(this.game.prefs[DARK_MODE].value == DARK_MODE_ENABLED);
      },

      ///////////////////////////////////////////////////
      //////	 Reaction to cometD notifications	 ///////
      ///////////////////////////////////////////////////

      /*
       * setupNotifications:
       *	In this method, you associate each of your game notifications with your local method to handle it.
       *	Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" in the santorini.game.php file.
       */
      setupNotifications: function () {
      	var notifs = [
      		['addHint',10],
          ['deleteHint',10],
          ['clearHints',10],
          ['clearColor',10],
          ['newGuess',10],
          ['newFeedback',10],
          ['orderHints', 10],
      	];

      	notifs.forEach(notif => {
      		dojo.subscribe(notif[0], this, "notif_" + notif[0]);
      		this.game.notifqueue.setSynchronous(notif[0], notif[1]);
      	});
      },
    }
  }
};
