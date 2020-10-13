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

  public function pickWord() {
    self::setAjaxMode();
    $i = self::getArg("i", AT_posint, true );
    $j = self::getArg("j", AT_posint, true );
    $result = $this->game->pickWord($i, $j);
    self::ajaxResponse();
  }


  public function addHint() {
    self::setAjaxMode();
    $mColor = self::getArg("mColor", AT_posint, true );
    $mType = self::getArg("mType", AT_posint, true );
    $x = self::getArg("x", AT_posint, true );
    $y = self::getArg("y", AT_posint, true );
    $sId = self::isArg("sId")? self::getArg("sId", AT_posint, true) : null;
    $result = $this->game->addHint($mColor, $mType, $x, $y, $sId);
    self::ajaxResponse();
  }

  public function moveHint() {
    self::setAjaxMode();
    $id = self::getArg("id", AT_posint, true );
    $x = self::getArg("x", AT_posint, true );
    $y = self::getArg("y", AT_posint, true );
    $result = $this->game->moveHint($id, $x, $y);
    self::ajaxResponse();
  }


  public function moveMark() {
    self::setAjaxMode();
    $sId = self::getArg("sId", AT_posint, true );
    $mColor = self::getArg("mColor", AT_posint, true );
    $result = $this->game->moveMark($mColor, $sId);
    self::ajaxResponse();
  }


  public function deleteHint() {
    self::setAjaxMode();
    $id = self::getArg("id", AT_posint, true );
    $result = $this->game->deleteHint($id);
    self::ajaxResponse();
  }


  public function validateJSonAlphaNum($value, $argName = "unknown"){
      if (is_array($value)) {
          foreach ($value as $key => $v) {
              $this->validateJSonAlphaNum($key);
              $this->validateJSonAlphaNum($v);
          }
          return true;
      }
      if (is_int($value)) return true;
      $bValid = ( preg_match( "/^[0-9a-zA-Z- ]*$/", $value ) === 1 );
      if (!$bValid)
          throw new feException( "Bad value for: $argName", true, true, FEX_bad_input_argument );
      return true;
  }

  public function orderHints(){
    self::setAjaxMode();
    $order = self::getArg("order", AT_json, true);
    $this->validateJSonAlphaNum($order,"order");
    $this->game->orderHints($order);
    self::ajaxResponse();
  }

  public function clearHints() {
    self::setAjaxMode();
    $color = self::getArg("color", AT_posint, true );
    $result = $this->game->clearHints($color);
    self::ajaxResponse();
  }

  public function confirmHints() {
    self::setAjaxMode();
    $result = $this->game->confirmHints();
    self::ajaxResponse();
  }


  public function newGuess() {
    self::setAjaxMode();
    $guess = self::getArg("guess", AT_base64, true );
    $result = $this->game->newGuess($guess);
    self::ajaxResponse();
  }

  public function pass() {
    self::setAjaxMode();
    $result = $this->game->pass();
    self::ajaxResponse();
  }

  public function giveUp() {
    self::setAjaxMode();
    $result = $this->game->giveUp();
    self::ajaxResponse();
  }


  public function addFeedback() {
    self::setAjaxMode();
    $gId = self::getArg("gId", AT_posint, true );
    $fb = self::getArg("feedback", AT_posint, true );
    $result = $this->game->addFeedback($gId, $fb);
    self::ajaxResponse();
  }

  public function wordFound() {
    self::setAjaxMode();
    $gId = self::getArg("gId", AT_posint, true );
    $result = $this->game->wordFound($gId);
    self::ajaxResponse();
  }

}
