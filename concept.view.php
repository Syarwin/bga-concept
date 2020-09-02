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

class view_concept_concept extends game_view
{
  function getGameName() {
      return "concept";
  }

	function build_page( $viewArgs )
	{
	}
}
