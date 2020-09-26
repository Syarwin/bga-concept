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
			'' => ST_NEXT_ROUND,
		],
	],

	ST_NEXT_ROUND => [
		"name" => "nextRound",
		"description" => "",
		"type" => "game",
		'action' => 'stNextRound',
		"possibleactions" => ["start", "stop"],
		"transitions" => [
			"startRound" => ST_START_ROUND,
			"endGame" => ST_GAME_END
		]
  ],

	ST_START_ROUND => [
		"name" => "startRound",
		"description" => clienttranslate('Other players must choose a word'),
		"descriptionmyturn" => clienttranslate('${you} must choose a word'),
		'type' => 'multipleactiveplayer',
		'action' => "stStartRound",
		'args' => "argStartRound",
		"possibleactions" => ["pickWord"],
		"transitions" => ['' => ST_GUESS]
  ],


  ST_GUESS => [
		"name" => "guessWord",
		"description" => clienttranslate('Other players can add an hint'),
		"descriptionmyturn" => clienttranslate('${you} can add an hint'),
		'type' => 'multipleactiveplayer',
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
