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
	'is_coop' => 0,


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

	'presentation' => [
		totranslate("This wonderful game is about finding the concept hiding behind some icons."),
		totranslate("Concept is a family game which has won or been nominated for no fewer than 8 awards throughout the world!"),
	],

	'tags' => [2,11,12,20,211],

//////// BGA SANDBOX ONLY PARAMETERS (DO NOT MODIFY)
	'is_sandbox' => false,
	'turnControl' => 'simple'
////////
];
