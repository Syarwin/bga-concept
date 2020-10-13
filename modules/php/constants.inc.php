<?php

define('WORD_FOUND', 2);

/*
 * State constants
 */
define('ST_GAME_SETUP', 1);
define('ST_NEXT_ROUND', 3);
define('ST_PICK_WORD', 4);
define('ST_ADD_HINT', 5);
define('ST_GUESS_WORD', 7);
define('ST_END_ROUND', 6);
define('ST_GAME_END', 99);


/*
 * Game options
 */
define('OPTION_TEAM_SIZE', 100);
define('ONE_PLAYER', 1);
define('TWO_PLAYERS', 2);

define('OPTION_HINT_MODE', 101);
define('SNAPPED', 1);
define('FREE', 2);


define('OPTION_EOG_SCORE', 103);
define('SHORT', 0);
define('STANDARD', 1);
define('INFINITE', 2);


define('DARK_MODE', 100);
define('DARK_MODE_DISABLED', 1);
define('DARK_MODE_ENABLED', 2);

define('DISPLAY_GRID', 101);
define('GRID_VISIBLE', 1);
define('GRID_HIDDEN', 2);
