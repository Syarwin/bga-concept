window.ConceptSnapped = function(game){
  var C = Concept(game);

  C.data.isFree = false;
  C.data.selectedSymbol = null;
  C.components = {
    'draggable' : window.vuedraggable,
  };

  C.computed.dragOptions = function() {
    return {
      animation: 100,
      group: "description",
      disabled: !this.isClueGiver,
      ghostClass: "ghost"
    };
  };


  // Compute the corresponding hints per symbol
  C.computed.hintsPerSymbol = function(){
    var t = [];
    for(var i = 0; i < this.symbols.length; i++)
      t[i] = {};

    for(var j = 0; j < this.hints.length; j++){
      if(typeof t[this.hints[j].sId][this.hints[j].mId] == "undefined")
        t[this.hints[j].sId][this.hints[j].mId] = 0;
      t[this.hints[j].sId][this.hints[j].mId]++;
    }

    return t;
  };


  // Compute a succinct representation of hints using parentId
  C.computed.organizedHints = function(){
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
  };


  // React to change to update tooltips and layout
  C.watch = {
    organizedHints(newHints, oldHints) {
      setTimeout(() => {
        dojo.query("#hints-only .hint .img").forEach(obj => {
          this.game.addTooltip(obj.id, this.symbols[dojo.attr(obj, "data-symbol")].join(", "), '');
        });
      }, 10);
    },
    displayGrid(newValue, oldValue){
      setTimeout(() => {
        this.onScreenWidthChange();
      }, 10);
    }
  };


  ////////////////////////////////////
  ////// Add/move/suppr hints	 ///////
  ////////////////////////////////////
  C.methods.selectSymbol = function(event, id){
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
  };


  // Trigger when clicking outside of symbol
  C.methods.unselectSymbol = function(){
    this.selectedSymbol = null;
  };

  // Triggered when a mark is clicked
  C.methods.addHint = function(color, type){
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
  };

  C.methods.removeHint = function(id){
    this.takeAction("deleteHint", { id : id} );
  };

  /*
   * reorderingHints: triggered whenever the clue giver dragndrop the hints
   */
  C.methods.reorderingHints = function(){
    var order = this.hints.map((hint, index) => {
      return {
        'hId' : hint.id,
        'order' : index,
      };
    });
    this.takeAction("orderHints", { order : JSON.stringify(order) });
  };


  ////////////////////////////////////
  ///////////   Utils    /////////////
  ////////////////////////////////////
  C.methods.getHintSize = function(id){
		var n = Object.keys(this.hintsPerSymbol[id]).length;
		switch(n){
			case 1: return 90;
			case 2: case 3: case 4: return 47;
			default: return (95 / Math.ceil(Math.sqrt(n)));
		}
	};

  C.methods.getBadgeSize = function(id){
		var n = Object.keys(this.hintsPerSymbol[id]).length;
		switch(n){
			case 1: return 1;
			case 2: case 3: case 4: return 0.80;
			default: return (95 / Math.ceil(Math.sqrt(n)));
		}
	};

  ////////////////////////////////////
  ////// Hints Notifications   ///////
  ////////////////////////////////////
  C.data.notifs.push(['moveMark',5]);
  C.methods.notif_moveMark = function(n){
//    debug("Notif: move marks", n);
    this.hints.forEach(hint => {
      if(hint.mColor == n.args.mColor && hint.mType == 0){
        hint.sId = n.args.sId;
      }
    });
  };

  C.data.notifs.push(['orderHints',5]);
  C.methods.notif_orderHints = function(n){
//    debug("Notif: reordering hints", n);
    this.hints = this.hints.reduce((tab, hint) => {
      let newIndex = n.args.order.reduce((carry, h) => h.hId == hint.id? h.order : carry, null);
      tab[newIndex] = hint;
      return tab;
    }, []);
  };


  return C;
};
