window.VueWrap = function(game){
  return {
    el: '#app',
    data: {
      game: game,
      playerId: game.player_id,
      isSpectator: game.isSpectator,
    },
    computed:{
      state: function(){ return this.game.gamedatas.gamestate },
      activePlayerId: function(){ return this.getActivePlayerId() },
    },
    methods:{
      isCurrentPlayerActive: function(){ return this.game.isCurrentPlayerActive() },
      getActivePlayerId: function() { return this.game.getActivePlayerId() },
      getActivePlayers: function() { return this.game.getActivePlayers() },

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


      onEnteringState: function(stateName, args){
        debug('Entering state: ' + stateName, args);
        debug(this.state);
      }
    }
  }
};
