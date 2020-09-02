<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Concept implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 *
 * concept.action.php
 *
 * Concept main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/concept/concept/myAction.html", ...)
 *
 */


class action_concept extends APP_GameAction
{
  // Constructor: please do not modify
  public function __default()
  {
    if( self::isArg( 'notifwindow') ){
      $this->view = "common_notifwindow";
      $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
    } else {
      $this->view = "concept_concept";
      self::trace( "Complete reinitialization of board game" );
    }
  }

  public function addHint() {
    self::setAjaxMode();
    $sid = self::getArg("sid", AT_posint, true );
    $mid = self::getArg("mid", AT_posint, true );
    $result = $this->game->addHint($sid, $mid);
    self::ajaxResponse();
  }
}
