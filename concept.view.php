<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Concept implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * concept.view.php
 *
 */

require_once( APP_BASE_PATH."view/common/game.view.php" );
require_once('modules/php/constants.inc.php');

class view_concept_concept extends game_view
{
  function getGameName() {
      return "concept";
  }

	function build_page($viewArgs)
	{
    $this->page->begin_block("concept_concept", "snapped");
    $this->page->begin_block("concept_concept", "free");

    $this->tpl['GUESSES'] = self::_("Guesses");

    if($this->game->getGameStateValue('optionHint') == FREE){
      $this->page->unset_var("snapped");
      $this->page->insert_block("free", []);
    } else {
      $this->page->unset_var("free");
      $this->page->insert_block("snapped", []);
    }
	}
}
