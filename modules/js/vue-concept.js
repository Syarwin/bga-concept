window.Concept = function(game){
  let DARK_MODE = 100;
  let DARK_MODE_DISABLED = 1;
  let DARK_MODE_ENABLED = 2;

  var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
  var debug = isDebug ? console.info.bind(window.console) : function () { };

  return {
    el: '#concept-app',
    data: {
      // Basic bga stuff
      game: game,
      playerId: game.player_id,
      isSpectator: game.isSpectator,

      // Concept stuff
      isFree:true,
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
      guess:'',
      scale:1,
    },
    computed:{
      // BGA stuff
      state: function(){ return this.game.gamedatas.gamestate },
      activePlayerId: function(){ return this.getActivePlayerId() },

      // Concept stuff
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
      setTimeout(() => this.onScreenWidthChange(), 1000);
      dojo.connect(document, 'onmousemove', this.moveHintAt.bind(this));
      dojo.connect(document, 'onmouseup', this.dragHintStop.bind(this));
    },


    methods:{
      isCurrentPlayerActive: function(){ return this.game.isCurrentPlayerActive() },
      getActivePlayerId: function() { return this.game.getActivePlayerId() },
      getActivePlayers: function() { return this.game.getActivePlayers() },
      addPrimaryActionButton: function(id, msg, callback){ this.game.addActionButton(id, msg, callback, null, false, "blue"); },
      checkAction: function(action) { return this.game.checkAction(action); },
      removeActionButtons: function() { this.game.removeActionButtons(); },
      decode: function(a) { return atob(a); },

      unselectSymbol: function(){ },

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

          if(stateName == "addHint" || stateName == "guessWord"){
            this.game.gamedatas.word = args.args.word;
            this.game.gamedatas.wordCount = args.args.wordCount;
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


      notif_updatePlayersInfo: function(n){
        debug("Notif: update users", n);

        Object.values(n.args.players).forEach(player => {
          this.game.scoreCtrl[player.id].setValue(player.score);
        });
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
      /*
       * newHint: when mousedown on a mark, create a hint and start dragging
       */
      newHint(color, type, event){
        if(!this.isClueGiver || event.button != 0 || (type == 0 && this.isMarkUsed(color))) return;

        var hint = {
          mColor : color,
          mType : type,
          x:0,
          y:0,
        };
        this.hints.push(hint);
        this.dragHintStart(this.hints.length - 1, event);
      },

      /*
       * dragHintStart: make the hint start following the mouse
       */
      dragHintStart(hintIndex, event) {
        if(!this.isClueGiver || event.button != 0) return;

        if (event.preventDefault) event.preventDefault();
        this.draggedHintIndex = hintIndex;
        this.draggedHint = this.hints[hintIndex];
        var boxGrid = $('concept-grid-fixed-width').getBoundingClientRect();
        var boxHint = event.target.getBoundingClientRect();
        this.dragOffset = {
          x : $('concept-marks').getBoundingClientRect()['width'] + boxGrid.x + event.clientX - boxHint.x,
          y : boxGrid.y + event.clientY - boxHint.y,
        };
        this.moveHintAt(event);
      },

      /*
       * moveHintAt: during the drag, move hint around
       */
      moveHintAt(event){
        if(this.draggedHint != null){
          this.draggedHint.x = parseInt((event.clientX - this.dragOffset.x) / this.scale);
          this.draggedHint.y = parseInt((event.clientY - this.dragOffset.y) / this.scale);
        }
      },


      /*
       * dragHintStop: onmouseup, stop the drag and react whether
       *     it's inside the board or outside
       */
      dragHintStop() {
        if(this.draggedHint == null) return;
        if(!this.isCurrentPlayerActive()) return;

        var box = $('concept-grid').getBoundingClientRect();

        // Delete hint by moving outside grid
        if(this.draggedHint.x < 0 || this.draggedHint.x > box.width
          || this.draggedHint.y < 0 || this.draggedHint.y > box.height){
          this.hints.splice(this.draggedHintIndex, 1);
          if(this.draggedHint.id)
            this.takeAction("deleteHint", { id : this.draggedHint.id} );
        }
        else {
          // Moving already existing hint
          if(this.draggedHint.id)
            this.takeAction("moveHint", this.draggedHint);
          // Creating new hint
          else {
            this.takeAction("addHint", this.draggedHint, () => {
              this.hints.splice(this.draggedHintIndex, 1);
            });
          }
        }

        this.draggedHint = null;
        this.dragOffset = null;
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


      notif_moveHint: function(n){
        debug("Notif: new hint", n);
        this.hints.forEach(hint => {
          if(hint.id == n.args.id){
            hint.x = n.args.x;
            hint.y = n.args.y;
          }
        });
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
        this.game.gamedatas.word = n.args.word;
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


      onScreenWidthChange: function(){
        let gridWidth = 1280;
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
      		['addHint',10],
          ['moveHint',10],
          ['deleteHint',10],
          ['clearHints',10],
          ['clearColor',10],
          ['newGuess',10],
          ['newFeedback',10],
          ['wordFound',5],
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
