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
      selectedSymbol: null,
      card:null,
      marks:[
        {pid:null, m:1 }, {pid:0, m:-1 },
        {pid:null, m:1 }, {pid:2, m:-1 },
        {pid:null, m:1 }, {pid:4, m:-1 },
        {pid:null, m:1 }, {pid:6, m:-1 },
        {pid:null, m:1 }, {pid:8, m:-1 },
      ],
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


  		// Compute the corresponding hints per symbol
  		hintsPerSymbol:function(){
  			var t = [];
  			for(var i = 0; i < this.symbols.length; i++)
  				t[i] = {};

  			for(var j = 0; j < this.hints.length; j++){
  				if(typeof t[this.hints[j].sid][this.hints[j].mid] == "undefined")
  					t[this.hints[j].sid][this.hints[j].mid] = 0;
  				t[this.hints[j].sid][this.hints[j].mid]++;
  			}

  			return t;
  		},


      // Compute a succinct representation of hints using parentId
      organizedHints: function(){
        if(this.marks == null)
          return;

        var t = [];
        for(var i = 0; i < this.marks.length; i++)
        if(this.marks[i].pid == null)
          t[i] = [];

        var order = [];

        for(var i = 0; i < this.hints.length; i++){
          var m = this.marks[this.hints[i].mid];
          var cid = (m.pid == null)? this.hints[i].mid : m.pid;
          if(!order.includes(cid))
            order.push(cid);

          var found = false;
          for(var j = 0; !found && j < t[cid].length; j++)
          if(t[cid][j].sid == this.hints[i].sid && t[cid][j].mid == this.hints[i].mid){
            found = true;

            if(typeof t[cid][j].n == "undefined")
              t[cid][j].n = 1;
            t[cid][j].n++;
          }

          if(!found)
            t[cid].push(this.hints[i]);
        }

        for(var i = 0; i < this.marks.length; i++)
        if(this.marks[i].pid == null)
          t[i].sort(a => b => { return (a.pid == null? -1 : 0) +  (b.pid == null? 1 : 0) });

        var res = [];
        for(var i = 0; i < order.length; i++)
          res.push(t[order[i]]);

        return res;
      },
    },


    created: function (){
      debug("SETUP", this.game.gamedatas);

      this.setupNotifications();

      this.card = this.game.gamedatas.cards[0];
    },


    methods:{
      isCurrentPlayerActive: function(){ return this.game.isCurrentPlayerActive() },
      getActivePlayerId: function() { return this.game.getActivePlayerId() },
      getActivePlayers: function() { return this.game.getActivePlayers() },


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
      //	if (["drawCard", "playCard", "react", "multiReact", "discardExcess"].includes(stateName) && !this.isCurrentPlayerActive()) return;

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



      ////////////////////////////////
      ////////////////////////////////
      /////////		Actions		//////////
      ////////////////////////////////
      ////////////////////////////////

      // Triggered when a symbol is clicked
  		selectSymbol: function(event, id){
  			if(!this.editing)
  				return;
  			event.stopPropagation();

  			// Show tooltip
        this.selectedSymbol = id;
  			var target = event.target;
  			if(!target.classList.contains("concept-symbol"))
  				target = target.parentNode;

  			new Popper(target, document.getElementById("concept-marks"), {
    			placement: (dojo.style(target.firstChild, "order") == 0)? 'left' : 'right',
  			});
  		},


      // Trigger when clicking outside of symbol
  		unselectSymbol:function(){
  			this.selectedSymbol = null;
  		},


  		// Triggered when a mark is clicked
  		selectMark: function(mark){
        this.takeAction('addHint', {
          sid:this.selectedSymbol,
          mid:mark,
        });
        this.selectedSymbol = null;
  		},


      notif_addHint: function(n){
        debug("Notif: new hint", n);
        this.hints.push(n.args);
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
      	];

      	notifs.forEach(notif => {
      		dojo.subscribe(notif[0], this, "notif_" + notif[0]);
      		this.game.notifqueue.setSynchronous(notif[0], notif[1]);
      	});
      },
    }
  }
};
