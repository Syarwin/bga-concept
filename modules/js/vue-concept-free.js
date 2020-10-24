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
    if(!this.isClueGiver || (type == 0 && this.isMarkUsed(color))) return;
    if(event.button != 0 && !event.touches) return;

    var hint = {
      mColor : color,
      mType : type,
      x:0,
      y:0,
    };
    this.hints.push(hint);

    if(event.touches)
      this.dragHintStartTouch(this.hints.length - 1, event);
    else
      this.dragHintStartMouse(this.hints.length - 1, event);
  };

  /*
   * dragHintStart: make the hint start following the mouse
   */
  C.methods.dragHintStartMouse = function(hintIndex, event) {
    if(!this.isClueGiver || event.button != 0) return;
    if (event.preventDefault) event.preventDefault();

    this.dragHintStart(hintIndex, {
      x:event.clientX,
      y:event.clientY,
      target:event.target,
    });
  };

  C.methods.dragHintStartTouch = function(hintIndex, event) {
    if (event.preventDefault) event.preventDefault();

    this.dragHintStart(hintIndex, {
      x:event.touches[0].clientX,
      y:event.touches[0].clientY,
      target:event.target,
    });
  };

  C.methods.dragHintStart = function(hintIndex, info) {
    if(!this.isClueGiver) return;

    this.draggedHintIndex = hintIndex;
    this.draggedHint = this.hints[hintIndex];
    var boxGrid = $('concept-grid-fixed-width').getBoundingClientRect();
    var boxHint = info.target.getBoundingClientRect();
    this.dragOffset = {
      x : $('concept-marks').getBoundingClientRect()['width'] + boxGrid.x + info.x - boxHint.x,
      y : boxGrid.y + info.y - boxHint.y,
    };
    this.moveHintAt(info);
  };

  /*
   * moveHintAt: during the drag, move hint around
   */
  C.methods.moveHintAtMouse = function(evt){
    this.moveHintAt({ x : evt.clientX, y : evt.clientY});
  };
  C.methods.moveHintAtTouch = function(evt){
    if (event.preventDefault) event.preventDefault();
    this.moveHintAt({ x : evt.touches[0].clientX, y : evt.touches[0].clientY});
  };


  C.methods.moveHintAt = function(info){
    if(this.draggedHint != null){
      this.draggedHint.x = parseInt((info.x - this.dragOffset.x) / this.scale);
      this.draggedHint.y = parseInt((info.y - this.dragOffset.y) / this.scale);
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
