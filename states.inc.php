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
 * states.inc.php
 *
 * Concept game states description
 *
 */

$machinestates = [
  /*
	 * BGA framework initial state. Do not modify.
	 */
	ST_GAME_SETUP => [
		'name' => 'gameSetup',
		'description' => '',
		'type' => 'manager',
		'action' => 'stGameSetup',
		'transitions' => [
			'' => ST_START,
		],
	],

    // Note: ID=2 => your first state

  ST_START => [
		"name" => "playerTurn",
		"description" => clienttranslate('${actplayer} can add an hint'),
		"descriptionmyturn" => clienttranslate('${you} can add an hint'),
		"type" => "activeplayer",
		"possibleactions" => ["addHint", "pass"],
		"transitions" => []
  ],


  /*
	 * BGA framework final state. Do not modify.
	 */
	ST_GAME_END => [
		'name' => 'gameEnd',
		'description' => clienttranslate('End of game'),
		'type' => 'manager',
		'action' => 'stGameEnd',
		'args' => 'argGameEnd'
	]
];
