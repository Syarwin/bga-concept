<?php

$gameinfos = [
	'game_name' => "Concept",
	'designer' => 'Gaëtan Beaujannot, Alain Rivollet',
	'artist' => 'Éric Azagury, Cédric Chevalier',
	'year' => 2013,
	'publisher' => 'Repos Production',
	'publisher_website' => 'https://www.concept-the-game.com/',
	'publisher_bgg_id' => 4384,
	'bgg_id' => 147151,
	'players' => [2,3,4,5,6,7,8,9,10,11,12],
	'suggest_player_number' => null,
	'not_recommend_player_number' => null,
	'language_dependency' => [
		1 => 'en',	2 => 'fr', 3 => 'it',	4 => 'de',	5 => 'es',	6 => 'pt',
		7 => 'ru', 	8 => 'el', 9 => 'da',	10 => 'cs',	11 => 'fi',	12 => 'nl',	13 => 'pl',
		14 => 'hu', 15 => 'ja',	16 => 'no',	17 => 'ro',	18 => 'bg',	19 => 'zh-cn',
	],

	'estimated_duration' => 30,
	'fast_additional_time' => 30,
	'medium_additional_time' => 40,
	'slow_additional_time' => 50,

	'tie_breaker_description' => "",
	'losers_not_ranked' => false,


	'is_beta' => 1,
	'is_coop' => 1,


	'complexity' => 3,
	'luck' => 0,
	'strategy' => 1,
	'diplomacy' => 4,

	'player_colors' => ["ff0000", "008000", "0000ff", "ffa500", "773300"],
	'favorite_colors_support' => true,

	// When doing a rematch, the player order is swapped using a "rotation" so the starting player is not the same
	// If you want to disable this, set this to true
	'disable_player_order_swap_on_rematch' => false,

	'game_interface_width' => [
    'min' => 900,
    'max' => null
	],

// Game presentation
// Short game presentation text that will appear on the game description page, structured as an array of paragraphs.
// Each paragraph must be wrapped with totranslate() for translation and should not contain html (plain text without formatting).
// A good length for this text is between 100 and 150 words (about 6 to 9 lines on a standard display)
'presentation' => [
//    totranslate("This wonderful game is about geometric shapes!"),
//    totranslate("It was awarded best triangle game of the year in 2005 and nominated for the Spiel des Jahres."),
//    ...
],

// Games categories
//  You can attribute a maximum of FIVE "tags" for your game.
//  Each tag has a specific ID (ex: 22 for the category "Prototype", 101 for the tag "Science-fiction theme game")
//  Please see the "Game meta information" entry in the BGA Studio documentation for a full list of available tags:
//  http://en.doc.boardgamearena.com/Game_meta-information:_gameinfos.inc.php
//  IMPORTANT: this list should be ORDERED, with the most important tag first.
//  IMPORTANT: it is mandatory that the FIRST tag is 1, 2, 3 and 4 (= game category)
'tags' => [2],


//////// BGA SANDBOX ONLY PARAMETERS (DO NOT MODIFY)

// simple : A plays, B plays, C plays, A plays, B plays, ...
// circuit : A plays and choose the next player C, C plays and choose the next player D, ...
// complex : A+B+C plays and says that the next player is A+B
'is_sandbox' => false,
'turnControl' => 'simple'

////////
];
