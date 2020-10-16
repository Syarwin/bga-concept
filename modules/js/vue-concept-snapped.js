window.ConceptSnapped = function(game){
  let DARK_MODE = 100;
  let DARK_MODE_DISABLED = 1;
  let DARK_MODE_ENABLED = 2;

  let DISPLAY_GRID = 101;
  let GRID_VISIBLE = 1;
  let GRID_HIDDEN = 2;

  let DISPLAY_TIMER = 102;
  let TIMER_VISIBLE = 1;
  let TIMER_HIDDEN = 2;

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
      timer:game.gamedatas.timer,
      interval:"",
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
      scale:1,
      displayReveal:false,
      revealSmiley:false,
      revealMessage:"",
      revealWord:"",
      revealLvl:"0",
    },
    computed:{
      // BGA stuff
      state: function(){ return this.game.gamedatas.gamestate },
      activePlayerId: function(){ return this.getActivePlayerId() },

      // Concept stuff
      displayGrid: function(){
        return this.game.prefs[DISPLAY_GRID].value == GRID_VISIBLE;
      },
      displayTimer: function(){
        return this.game.prefs[DISPLAY_TIMER].value == TIMER_VISIBLE;
      },

      formatedTimer: function(){
        if(this.timer == null)
          return "";

        let m = parseInt(this.timer/60);
        let s = "" + parseInt(this.timer)%60;
        return m + ":" + s.padStart(2, '0');
      },

      word:function(){
        let w = this.game.gamedatas.word;
        if(w == null) return '';
        else return w.j? this.game.gamedatas.cards[w.card][w.i][w.j] : '???';
      },

      wordLvl:function(){
        let w = this.game.gamedatas.word;
        return (w == null)? -1 : w.i;
      },

      wordCount: function(){
        return parseInt(this.game.gamedatas.wordCount) + 1;
      },

      endOfGame: function(){
        return this.game.gamedatas.endOfGame == -1 ? '∞' : this.game.gamedatas.endOfGame;
      },

      isClueGiver: function(){
        return this.team.includes(this.playerId);
      },

      gaveUp: function(){
        return this.players[this.playerId].gaveup == 1;
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
        for(var i = 1; i <= 5; i++)
          t[i] = [];

        var order = [];
        this.hints.forEach(hint => {
          if(! [1,2,3,4,5].includes(hint.mColor)) return;

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
      this.updatePlayers(this.game.gamedatas.players);
      this.setupNotifications();
    },

    mounted: function(){
      this.symbols.forEach((symbol, id) => {
        this.game.addTooltip("symbol-" + id, symbol.join(", "), '');
      });

      dojo.query("#hints-only .hint .img").forEach(obj => {
        this.game.addTooltip(obj.id, this.symbols[dojo.attr(obj, "data-symbol")].join(", "), '');
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
      setTimeout(() => this.onScreenWidthChange(), 1000);
    },

    watch: {
      organizedHints: function (newHints, oldHints) {
        setTimeout(() => {
          dojo.query("#hints-only .hint .img").forEach(obj => {
            this.game.addTooltip(obj.id, this.symbols[dojo.attr(obj, "data-symbol")].join(", "), '');
          });
        }, 10);
      },
      displayGrid: function (newValue, oldValue){
        setTimeout(() => {
          this.onScreenWidthChange();
        }, 10);
      }
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

        if(stateName == "pickWord")
          clearInterval(this.interval);

        // Stop here if it's not the current player's turn for some states
      	if (["pickWord"].includes(stateName) && !this.isCurrentPlayerActive()) return;

        if(args.args && args.args['team'])
          this.team = args.args['team'].map(o => parseInt(o));

        if(stateName == "addHint" || stateName == "guessWord"){
          this.game.gamedatas.word = args.args.word;
          this.game.gamedatas.wordCount = args.args.wordCount;
          this.game.gamedatas.timer = parseInt(args.args.timer);
          this.timer = parseInt(args.args.timer);
          this.launchInterval();
          if(args.args['_private'])
            this.game.gamedatas.word = args.args['_private'];
        }

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

        if (["addHint", "guessWord"].includes(stateName) && this.timer > 180 && !this.gaveUp){
          this.addPrimaryActionButton("btnGiveUp", _("Give up"), () => this.giveUp());
        }

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



      launchInterval: function(){
        if(this.interval)
          clearInterval(this.interval);

        this.interval = setInterval( () => {
          this.timer += 1;
          if(this.timer > 180 && this.timer < 190){
            this.clearPossible();
          }
        }, 1000);
      },

      giveUp: function(){
        this.takeAction("giveUp", {});
        this.removeActionButtons();
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

        // First hint ? Must be the green '?'
        if(this.hints.length == 0){
          this.takeAction('addHint', {
            mColor : 1,
            mType : 0,
            sId:id,
            x:0,
            y:0,
          });
          return;
        }


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
        if(!this.isMarkUsed(color) && type == 1)
          return;

        // If we try to click on ?,! when it's already placed, then move the mark
        if(this.isMarkUsed(color) && type == 0){
          this.takeAction('moveMark', {
            mColor : color,
            sId:this.selectedSymbol,
          });

          return;
        }

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
        return this.hints.reduce((carry, hint) => carry || (hint.mType == 0 && hint.mColor == color), false);
      },

      notif_addHint: function(n){
        debug("Notif: new hint", n);
        for(var a in n.args){
          n.args[a] = parseInt(n.args[a]);
        }
        this.hints.push(n.args);
      },

      notif_deleteHint: function(n){
        debug("Notif: remove hint", n);
        var index = this.hints.reduce( (carry, hint, i) => hint.id == n.args.id? i : carry, null);
        if(index != null)
          this.hints.splice(index, 1);
      },


      notif_moveMark: function(n){
        debug("Notif: move marks", n);
        this.hints.forEach(hint => {
          if(hint.mColor == n.args.mColor && hint.mType == 0){
            hint.sId = n.args.sId;
          }
        });
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


      notif_wordFound: function(n){
        debug("Notf: word found", n);
        let w = n.args.word;
        this.game.gamedatas.word = w;
        this.revealWord = this.game.gamedatas.cards[w.card][w.i][w.j];
        this.revealLvl = w.i;
        this.revealSmiley = n.args.player_name? true : false;
        this.revealMessage = n.args.player_name?
          dojo.string.substitute(_("${player} found the word"), { player : n.args.player_name })
          : _("No one found the word :");
        this.displayReveal = true;
        setTimeout( () => dojo.addClass("concept-reveal-container", "toggle"), 500);
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



      updatePlayers: function(players){
        Object.values(players).forEach(player => {
          if(this.game.scoreCtrl[player.id])
            this.game.scoreCtrl[player.id].setValue(player.score);

          dojo.removeClass('overall_player_board_' + player.id, "gaveup cluegiver")
          if(player.gaveup == 1){
            console.log(player,"test")
            dojo.addClass('overall_player_board_' + player.id, "gaveup");
          }
        });
      },

      notif_updatePlayersInfo: function(n){
        debug("Notif: update users", n);
        this.updatePlayers(n.args.players);
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

      toggleGrid: function(){
        this.setPreferenceValue(DISPLAY_GRID, $('chk-grid').checked? GRID_HIDDEN : GRID_VISIBLE)
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

      onScreenWidthChange: function(){
        let gridWidth = 1100;
        let gridHeight = 800;
        let box = $('concept-grid-container').getBoundingClientRect();
        this.scale = Math.min(box['width'] / gridWidth, box['height'] / gridHeight);
        dojo.style('concept-guesses-container', 'maxHeight', (790 * this.scale) + 'px');
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
      		['addHint',5],
          ['moveMark',5],
          ['deleteHint',5],
          ['clearHints',5],
          ['clearColor',5],
          ['newGuess',5],
          ['newFeedback',5],
          ['wordFound',1500],
          ['orderHints', 5],
          ['updatePlayersInfo',5]
      	];

      	notifs.forEach(notif => {
      		dojo.subscribe(notif[0], this, "notif_" + notif[0]);
      		this.game.notifqueue.setSynchronous(notif[0], notif[1]);
      	});
      },
    }
  }
};
