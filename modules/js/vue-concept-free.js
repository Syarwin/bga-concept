window.ConceptFree = function(game){
  var C = Concept(game);

  C.data.draggedHintIndex = null;
  C.data.dragOffset = null;

  ////////////////////////////////////
  ////// Add/move/suppr hints	 ///////
  ////////////////////////////////////
  /*
   * newHint: when mousedown on a mark, create a hint and start dragging
   */
  C.methods.newHint = function(color, type, event){
    if(!this.isClueGiver || event.button != 0 || (type == 0 && this.isMarkUsed(color))) return;

    var hint = {
      mColor : color,
      mType : type,
      x:0,
      y:0,
    };
    this.hints.push(hint);
    this.dragHintStart(this.hints.length - 1, event);
  };

  /*
   * dragHintStart: make the hint start following the mouse
   */
  C.methods.dragHintStart = function(hintIndex, event) {
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
  };

  /*
   * moveHintAt: during the drag, move hint around
   */
  C.methods.moveHintAt = function(event){
    if(this.draggedHint != null){
      this.draggedHint.x = parseInt((event.clientX - this.dragOffset.x) / this.scale);
      this.draggedHint.y = parseInt((event.clientY - this.dragOffset.y) / this.scale);
    }
  };


  /*
   * dragHintStop: onmouseup, stop the drag and react whether
   *     it's inside the board or outside
   */
  C.methods.dragHintStop = function() {
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
  };

  ////////////////////////////////////
  ////// Hints Notifications   ///////
  ////////////////////////////////////
  C.data.notifs.push(['moveHint',10]);
  C.methods.notif_moveHint = function(n){
    this.hints.forEach(hint => {
      if(hint.id == n.args.id){
        hint.x = n.args.x;
        hint.y = n.args.y;
      }
    });
  };

  return C;
};
