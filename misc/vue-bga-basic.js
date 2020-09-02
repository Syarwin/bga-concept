window.VueWrap = function(game){
  return {
    el: '#app',
    data: {
      message: 'Hello Vue !',
      game: game,
      player_id: game.player_id,
    },
    computed:{
      state: function(){ return this.game.gamedatas.gamestate },
    },
    methods:{
      isCurrentPlayerActive: function(){ return this.game.isCurrentPlayerActive() },
      getActivePlayerId(): function() { return this.game.getActivePlayerId() },

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
        debug('Vue Entering state: ' + stateName, args);
        debug(this.state);
      }
    }
  }
};
