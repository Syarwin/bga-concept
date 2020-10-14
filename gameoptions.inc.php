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

require_once("modules/php/constants.inc.php");

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
   'displaycondition' => [
     [
      'type' => 'otheroption',
      'id' => GAMESTATE_CLOCK_MODE,
      'value' => [0,1,2,9],
    ],
    'notdisplayedmessage' => totranslate('Two clue givers can only be played real time'),
  ]
 ],

 OPTION_HINT_MODE => [
   'name' => totranslate('Hint mode'),
   'values' => [
     SNAPPED => [
       'name' => totranslate('Snapped'),
       'tmdisplay' => totranslate('Snapped'),
       'description' => totranslate('A hint is associated to a symbol'),
     ],
     FREE => [
       'name' => totranslate('Free'),
       'tmdisplay' => totranslate('Anywhere on the board'),
       'description' => totranslate('Hints can be put anywhere on the board. Disclaimer : for big enough screen only !'),
       'nobeginner' => true,
     ],
   ],
 ],

 OPTION_EOG_SCORE=> [
   'name' => totranslate('End of game'),
   'default' => STANDARD,
   'values' => [
     SHORT => [
       'name' => totranslate('Short'),
       'tmdisplay' => totranslate('1 word per player'),
       'description' => totranslate('Stop when 1 word per player are guess correctly'),
     ],
     STANDARD => [
       'name' => totranslate('Standard'),
       'tmdisplay' => totranslate('12 words / 2 words per player'),
       'description' => totranslate('Stop when 12 words are guess correctly / 2 words per players'),
     ],
     INFINITE => [
       'name' => totranslate('No end'),
       'tmdisplay' => totranslate('No limit'),
       'description' => totranslate('Play as long as you want'),
     ],
   ],
  ]
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

  DISPLAY_GRID => [
    'name' => totranslate('Grid display as guesser (snapped mode only)'),
    'needReload' => false,
    'values' => [
      GRID_VISIBLE => ['name' => totranslate('Visible')],
      GRID_HIDDEN  => ['name' => totranslate('Hidden')],
    ]
  ],

  DISPLAY_TIMER => [
    'name' => totranslate('Display the timer'),
    'needReload' => false,
    'values' => [
      TIMER_VISIBLE => ['name' => totranslate('Visible')],
      TIMER_HIDDEN  => ['name' => totranslate('Hidden')],
    ]
  ],

];
