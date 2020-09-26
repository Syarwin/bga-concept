window.Concept = function(game){
  return {
    el: '#concept-app',
    data: {
      // Basic bga stuff
      game: game,
      playerId: game.player_id,
      isSpectator: game.isSpectator,

      // Concept stuff
      symbols:ConceptSymbols(),
      hints:game.gamedatas.hints,
      displayCard:false,
      card:null,
      marks:[
        {pid:null, m:1 }, {pid:0, m:-1 },
        {pid:null, m:1 }, {pid:2, m:-1 },
        {pid:null, m:1 }, {pid:4, m:-1 },
        {pid:null, m:1 }, {pid:6, m:-1 },
        {pid:null, m:1 }, {pid:8, m:-1 },
      ],

      draggedHint:null,
      draggedHintIndex:null,
      dragOffset:null,
    },
    computed:{
      // BGA stuff
      state: function(){ return this.game.gamedatas.gamestate },
      activePlayerId: function(){ return this.getActivePlayerId() },

      // Concept stuff
      editing: function() { return true; },

      // Compute the number of times the marks are used to disable them if maxUse is reached
  		marksUses: function(){
  			var t = [];
  			for(var i = 0; i < this.marks.length; i++)
  				t[i] = 0;
  			for(var j = 0; j < this.hints.length; j++)
  				t[this.hints[j].mid]++;
  			return t;
  		},
    },


    created: function (){
      debug("SETUP", this.game.gamedatas);

      this.setupNotifications();
    },


    methods:{
      isCurrentPlayerActive: function(){ return this.game.isCurrentPlayerActive() },
      getActivePlayerId: function() { return this.game.getActivePlayerId() },
      getActivePlayers: function() { return this.game.getActivePlayers() },
      addPrimaryActionButton: function(id, msg, callback){ this.game.addActionButton(id, msg, callback, null, false, "blue"); },

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
      	if (["startRound"].includes(stateName) && !this.isCurrentPlayerActive()) return;

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
      },


      /*
       * takeAction: default AJAX call with locked interface
       */
      takeAction: function (action, data, callback) {
        data = data || {};
        data.lock = true;
        callback = callback || function (res) { };
        var gameName = this.game.name();
        this.game.ajaxcall("/" + gameName + "/" + gameName + "/" + action + ".html", data, this, callback);
      },


      ////////////////////////////
      //////	Choose word	 ///////
      ////////////////////////////
      onEnteringStateStartRound: function(args){
        this.card = this.game.gamedatas.cards[args['_private']];
        this.displayCard = true;
        this.addPrimaryActionButton('buttonShowCard', _('Show card'), () => { this.displayCard = true });
      },


      ////////////////////////////////
      //////	Dragging hints	 ///////
      ////////////////////////////////

      newHint(markIndex, event){
        var hint = {
          mid : markIndex,
          x:0,
          y:0,
        };
        this.hints.push(hint);
        this.dragHintStart(this.hints.length - 1, event);
      },
      dragHintStart(hintIndex, event) {
        if (event.preventDefault) event.preventDefault();
        this.draggedHintIndex = hintIndex;
        this.draggedHint = this.hints[hintIndex];
        var box = event.target.getBoundingClientRect();
        this.dragOffset = {
          x : box.x + box.width/2 - event.clientX,
          y : box.y + box.height/2 - event.clientY,
        };
        this.moveHintAt(event);
      },
      dragHintStop() {
        if(this.draggedHint == null) return;

        var box = $('concept-grid').getBoundingClientRect();

        // Delete hint by moving outside grid
        if(this.draggedHint.x < 0 || this.draggedHint.x > box.width
          || this.draggedHint.y < 0 || this.draggedHint.y > box.height){
          this.hints.splice(this.draggedHintIndex, 1);
          if(this.draggedHint.id)
            this.takeAction("removeHint", { id : this.draggedHint.id} );
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
      moveHintAt(event){
        if(this.draggedHint != null){
          var box = $('concept-grid').getBoundingClientRect();
          var box2 = $('mark-0').getBoundingClientRect();
          this.draggedHint.x = event.clientX - box.x - box2.width/2 + this.dragOffset.x;
          this.draggedHint.y = event.clientY - box.y - box2.height/2 + this.dragOffset.y;
        }
      },



      notif_addHint: function(n){
        debug("Notif: new hint", n);
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

      	this.removeActionButtons();
      	this.onUpdateActionButtons(this.gamedatas.gamestate.name, this.gamedatas.gamestate.args);
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
      		['addHint',500],
          ['moveHint',10],
      	];

      	notifs.forEach(notif => {
      		dojo.subscribe(notif[0], this, "notif_" + notif[0]);
      		this.game.notifqueue.setSynchronous(notif[0], notif[1]);
      	});
      },
    }
  }
};
