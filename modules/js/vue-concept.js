window.Concept = function(game){
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
    data: {
      // Basic bga stuff
      game: game,
      playerId: game.player_id,
      isSpectator: game.isSpectator,
      notifs: [
        ['addHint',10],
        ['deleteHint',10],
        ['clearHints',10],
        ['clearColor',10],
        ['newGuess',10],
        ['newFeedback',10],
        ['wordFound',5],
        ['updatePlayersInfo',5]
      ],

      // Concept stuff
      isFree:true,
      symbols:window.ConceptSymbols(),
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
      guess:'',
      scale:1,
      displayReveal:false,
      revealSmiley:false,
      revealMessage:"",
      revealWord:"",
      revealLvl:"0",
      draggedHint:null,
    },
    computed:{
      // BGA stuff
      state(){ return this.game.gamedatas.gamestate },
      activePlayerId(){ return this.getActivePlayerId() },

      // Concept stuff
      displayGrid(){
        return this.game.prefs[DISPLAY_GRID].value == GRID_VISIBLE;
      },
      displayTimer(){
        return this.game.prefs[DISPLAY_TIMER].value == TIMER_VISIBLE;
      },

      formatedTimer(){
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

      wordLvl(){
        let w = this.game.gamedatas.word;
        return (w == null)? -1 : w.i;
      },

      wordCount(){
        return parseInt(this.game.gamedatas.wordCount) + 1;
      },

      endOfGame(){
        return this.game.gamedatas.endOfGame == -1 ? '∞' : this.game.gamedatas.endOfGame;
      },

      isClueGiver(){
        return this.team.includes(this.playerId);
      },

      gaveUp(){
        return this.players[this.playerId].gaveup == 1;
      },

      lastSeparatorId(){
        return this.guesses.reduce((id, guess) => (id != 0 || guess.pId != -1)? id : guess.id, 0);
      }
    },


    created(){
      debug("SETUP", this.game.gamedatas);
      this.updatePlayers(this.game.gamedatas.players);
      this.setupNotifications();
    },

    mounted(){
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

      if(this.isFree){
        dojo.connect(document, 'onmousemove', this.moveHintAtMouse.bind(this));
        dojo.connect(document, 'ontouchmove', this.moveHintAtTouch.bind(this));
        dojo.connect(document, 'onmouseup', this.dragHintStop.bind(this));
        dojo.connect(document, 'ontouchend', this.dragHintStop.bind(this));
        dojo.connect(document, 'ontouchcancel', this.dragHintStop.bind(this));
      }
    },


    methods:{
      isCurrentPlayerActive(){ return this.game.isCurrentPlayerActive() },
      getActivePlayerId() { return this.game.getActivePlayerId() },
      getActivePlayers() { return this.game.getActivePlayers() },
      addPrimaryActionButton(id, msg, callback){ this.game.addActionButton(id, msg, callback, null, false, "blue"); },
      checkAction(action) { return this.game.checkAction(action); },
      removeActionButtons() { this.game.removeActionButtons(); },
      decode(str) {
        return decodeURIComponent(atob(str).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
       },
      encode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
          function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
          })
        );
      },

      unselectSymbol(){ },

      /*
       * onEnteringState:
       * 	this method is called each time we are entering into a new game state.
       * params:
       *	- str stateName : name of the state we are entering
       *	- mixed args : additional information
       */
      onEnteringState(stateName, args){
        debug('Entering state: ' + stateName, args);

        if(stateName == "pickWord")
          clearInterval(this.interval);

        // Stop here if it's not the current player's turn for some states
      	if (["pickWord"].includes(stateName) && !this.isCurrentPlayerActive()) return;

        // Update team
        if(args.args && args.args['team'])
          this.team = args.args['team'].map(o => parseInt(o));

        if(stateName == "addHint" || stateName == "guessWord"){
          // Update pagetitle
          var state = this.game.gamedatas.gamestate, desc = "";
          if(this.isClueGiver)
            desc = this.isFree? state.descriptionteamfree : state.descriptionteam;
          else
            desc = state.descriptionguessers;
          this.game.gamedatas.gamestate.description = desc;
          this.game.gamedatas.gamestate.descriptionmyturn = desc;
          this.game.updatePageTitle();

          // Update word/timer
          this.game.gamedatas.word = args.args.word;
          this.game.gamedatas.wordCount = args.args.wordCount;
          this.game.gamedatas.timer = args.args.timer;
          this.timer = args.args.timer;
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
      onLeavingState(stateName) {
      	debug('Leaving state: ' + stateName);
      	this.clearPossible();
      },


      /*
       * clearPossible:	clear every clickable space
       */
      clearPossible() {
        debug("Clearing everything");

        this.draggedHint = null;
        this.draggedHintIndex = null;
        this.displayCard = false;
      	this.removeActionButtons();
      	this.onUpdateActionButtons(this.game.gamedatas.gamestate.name, this.game.gamedatas.gamestate.args);
      },


      /*
       * onUpdateActionButtons:
       * 	called by BGA framework before onEnteringState
       *	in this method you can manage "action buttons" that are displayed in the action status bar (ie: the HTML links in the status bar).
       */
      onUpdateActionButtons(stateName, args) {
      	debug('Update action buttons: ' + stateName, args);
        if(this.isSpectator) return;
        if (["addHint", "guessWord"].includes(stateName) && this.timer > 180 && !this.gaveUp){
          this.addPrimaryActionButton("btnGiveUp", _("Give up"), () => this.giveUp());
        }

      	if (!this.isCurrentPlayerActive()) // Make sure the player is active
      		return;

        if (stateName == "addHint" && !this.game.bRealtime){
          this.addPrimaryActionButton("btnConfirmHints", _("Make me inactive"), () => this.confirmHints());
        } else if (stateName == "guessWord" && !this.game.bRealtime){
          this.addPrimaryActionButton("btnPass", _("Make me inactive"), () => this.pass());
        }
      },


      /*
       * takeAction: default AJAX call with locked interface
       */
      takeAction(action, data, callback) {
        if(this.isSpectator) return false;

        data = data || {};
        data.lock = true;
        callback = callback || function (res) { };
        var gameName = this.game.game_name;
        this.game.ajaxcall("/" + gameName + "/" + gameName + "/" + action + ".html", data, this, callback);
      },


      launchInterval(){
        if(this.interval)
          clearInterval(this.interval);

        this.interval = setInterval( () => {
          this.timer += 1;
          if(this.timer > 180 && this.timer < 190){
            this.clearPossible();
          }
        }, 1000);
      },

      giveUp(){
        this.takeAction("giveUp", {});
        this.removeActionButtons();
      },


      updatePlayers(players){
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

      notif_updatePlayersInfo(n){
        debug("Notif: update users", n);
        this.updatePlayers(n.args.players);
      },


      ////////////////////////////
      //////	Choose word	 ///////
      ////////////////////////////
      onEnteringStatePickWord(args){
        Object.assign(this.card, this.game.gamedatas.cards[args['_private']]);
        this.displayCard = true;
        this.addPrimaryActionButton('buttonShowCard', _('Show card'), () => { this.displayCard = true });
      },


      selectCardWord(i,j){
        if(!this.checkAction('pickWord')) return;
        this.takeAction("pickWord", { i : i, j : j});
      },

      ////////////////////////////////////
      ////// Add/move/suppr hints	 ///////
      ////////////////////////////////////
      /*
       * clearHints: clear all the hints of given color
       */
      clearHints(mColor){
        this.takeAction("clearHints", {color:mColor});
      },

      /*
       * confirmHints: make the player inactive
       */
      confirmHints(){
        this.takeAction("confirmHints", {});
      },

      ////////////////////////////////////
      ////// Hints Notifications   ///////
      ////////////////////////////////////
      isMarkUsed(color){
        return this.hints.reduce((carry, hint) => carry || (hint.mType == 0 && hint.mColor == color), false);
      },

      notif_addHint(n){
        debug("Notif: new hint", n);
        for(var a in n.args){
          n.args[a] = parseInt(n.args[a]);
        }
        this.hints.push(n.args);
      },


      notif_moveHint(n){
        debug("Notif: new hint", n);
        this.hints.forEach(hint => {
          if(hint.id == n.args.id){
            hint.x = n.args.x;
            hint.y = n.args.y;
          }
        });
      },

      notif_deleteHint(n){
        debug("Notif: remove hint", n);
        var index = this.hints.reduce( (carry, hint, i) => hint.id == n.args.id? i : carry, null);
        if(index != null)
          this.hints.splice(index, 1);
      },


      notif_clearHints(n){
        debug("Notif: clearing all hints", n);
        this.hints = [];
      },

      notif_clearColor(n){
        debug("Notif: clearing all hints of a color", n);
        this.hints = this.hints.filter(hint => hint.mColor != n.args.color);
      },


      /////////////////////////
      //////  Guesses   ///////
      /////////////////////////
      newGuess(){
        if(this.guess == "") return;

        this.takeAction("newGuess", { guess: this.encode(this.guess) });
        this.guess = "";
      },


      notif_newGuess(n){
        debug("Notif: new guess", n);
        this.guesses.unshift(n.args);
      },


      /*
       * pass: make the player inactive
       */
      pass(){
        this.takeAction("pass", {});
      },


      showFeedbackChoices(guess){
        if(guess.pId == -1 || !this.isClueGiver || guess.id < this.lastSeparatorId) return;

        this.displayFeedback = true;
        this.guessFeedback = guess;
      },


      wordFound(){
        debug("Word found");
        this.takeAction("wordFound", {
          gId: this.guessFeedback.id,
        });
      },



      addFeedback(feedback){
        debug("Feeback", feedback);
        this.takeAction("addFeedback", {
          gId: this.guessFeedback.id,
          feedback: feedback
        });
      },


      notif_newFeedback(n){
        debug("Notif: new feedback", n);
        this.guesses.forEach(guess => {
          if(guess.id == n.args.gId)
            guess.feedback = n.args.feedback;
        });
      },

      notif_wordFound(n){
        debug("Notf: word found", n);
        let w = n.args.word;
        this.game.gamedatas.word = w;
        if(n.args.reveal == 0)
          return;

        this.revealWord = this.game.gamedatas.cards[w.card][w.i][w.j];
        this.revealLvl = w.i;
        this.revealSmiley = n.args.player_name? true : false;
        this.revealMessage = n.args.player_name?
          dojo.string.substitute(_("${player} found the word"), { player : n.args.player_name })
          : _("No one found the word :");
        this.displayReveal = true;
        setTimeout( () => dojo.addClass("concept-reveal-container", "toggle"), 500);
      },

      /////////////////////////////////////////////
      /////////////	  Preferences 	 /////////////
      ////////////////////////////////////////////
      onPreferenceChange(pref, value) {
        if(pref == DARK_MODE)
          this.toggleDarkMode(value == DARK_MODE_ENABLED, false);
		  },

      setPreferenceValue(pref, newVal){
        this.game.setPreferenceValue(pref, newVal)
      },

      toggleGrid(){
        this.setPreferenceValue(DISPLAY_GRID, $('chk-grid').checked? GRID_HIDDEN : GRID_VISIBLE)
      },

      toggleDarkMode(enabled){
        if(enabled){
          dojo.query("html").addClass("darkmode");
          $('chk-darkmode').checked = true;
        } else {
          dojo.query("html").removeClass("darkmode");
          $('chk-darkmode').checked = false;
        }
      },

      addDarkModeSwitch(){
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


      onScreenWidthChange(){
        let gridWidth = 1280;
        let gridHeight = 800;
        let box = $('concept-grid-container').getBoundingClientRect();
        this.scale = Math.min(box['width'] / gridWidth, box['height'] / gridHeight);
        dojo.style('concept-guesses-container', 'maxHeight', (790 * this.scale) + 'px');

        if($("hints"))
          dojo.style('hints', 'maxHeight', (790 * this.scale) + 'px');
      },
      ///////////////////////////////////////////////////
      //////	 Reaction to cometD notifications	 ///////
      ///////////////////////////////////////////////////

      /*
       * setupNotifications:
       *	In this method, you associate each of your game notifications with your local method to handle it.
       *	Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" in the santorini.game.php file.
       */
      setupNotifications() {
      	this.notifs.forEach(notif => {
      		dojo.subscribe(notif[0], this, "notif_" + notif[0]);
      		this.game.notifqueue.setSynchronous(notif[0], notif[1]);
      	});
      },
    }
  }
};
