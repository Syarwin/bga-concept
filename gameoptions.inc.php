<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Concept implementation : © Timothée Pecatte - tim.pecatte@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * Concept game options description
 *
 */

require_once("modules/constants.inc.php");

$game_options = [
 OPTION_TEAM_SIZE => [
   'name' => totranslate('Team size'),
   'values' => [
      TWO_PLAYERS => [
       'name' => totranslate('Two players'),
       'tmdisplay' => totranslate('Two players'),
       'description' => totranslate('At each round, two players will make other players guess a word'),
     ],
     ONE_PLAYER => [
       'name' => totranslate('One player'),
       'tmdisplay' => totranslate('One player'),
       'description' => totranslate('At each round, one player will make other players guess a word'),
       'nobeginner' => true,
     ],
   ],
   'startcondition' => [
     TWO_PLAYERS => [
       [
        'type' => 'minplayers',
        'value' => 4,
        'message' => totranslate('Two clue givers needs at least 4 players'),
       ],
     ],
   ],
 ],
];



$game_preferences = [
  DARK_MODE => [
    'name' => totranslate('Dark mode'),
    'needReload' => false,
    'values' => [
      DARK_MODE_DISABLED  => ['name' => totranslate('Disabled')],
      DARK_MODE_ENABLED   => ['name' => totranslate('Enabled')],
    ]
  ],
];
