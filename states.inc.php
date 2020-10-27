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
			"startRound" => ST_PICK_WORD,
			"endGame" => ST_GAME_END
		]
  ],

	ST_PICK_WORD => [
		"name" => "pickWord",
		"description" => clienttranslate('Other players must choose a word'),
		"descriptionmyturn" => clienttranslate('${you} must choose a word'),
		'type' => 'multipleactiveplayer',
		'args' => "argPickWord",
		"possibleactions" => ["pickWord"],
		"transitions" => ['' => ST_ADD_HINT]
  ],


	ST_ADD_HINT => [
		"name" => "addHint",
		"description" => '',
		"descriptionmyturn" => '',
    "descriptionguessers" => clienttranslate('You can make a guess'),
    "descriptionteam" => clienttranslate('You can add hints on the board by clicking on symbols'),
    "descriptionteamfree" => clienttranslate('You can add hints on the board by dragndrop tokens'),
		'type' => 'multipleactiveplayer',
		'action' => "stAddHint",
		'args' => "argPlay",
		"possibleactions" => ["addHint", "pass"],
		"transitions" => [
			'confirm' => ST_ADD_HINT,
			'found' => ST_NEXT_ROUND,
			'giveup' => ST_NEXT_ROUND,
      'exact' => ST_WAITING_SCORE,
		]
  ],

  // TODO : remove state
  ST_GUESS_WORD => [
		"name" => "guessWord",
    "description" => '',
		"descriptionmyturn" => '',
    "descriptionguessers" => clienttranslate('You can make a guess'),
    "descriptionteam" => clienttranslate('You can add hints on the board by clicking on symbols'),
    "descriptionteamfree" => clienttranslate('You can add hints on the board by dragndrop tokens'),
		'type' => 'multipleactiveplayer',
		'action' => "stGuessWord",
		'args' => "argPlay",
		"possibleactions" => ["pass"],
		"transitions" => [
			'pass' => ST_ADD_HINT,
			'found' => ST_NEXT_ROUND,
			'giveup' => ST_NEXT_ROUND,
      'exact' => ST_WAITING_SCORE,
		]
  ],


  ST_WAITING_SCORE => [
		"name" => "waitingScore",
		"description" => clienttranslate('The correct word was found, waiting for clue givers to attribute score'),
		"descriptionmyturn" => clienttranslate('${you} must attribute score to the oldest correct guess'),
		'type' => 'multipleactiveplayer',
    'args' => "argPlay",
    'action' => "stWaitingScore",
		"possibleactions" => [],
		"transitions" => [
			'found' => ST_NEXT_ROUND,
		]
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
