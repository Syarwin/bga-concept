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
* concept.game.php
*
*/


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );


class Concept extends Table
{
	function __construct() {
		parent::__construct();

		self::initGameStateLabels([]);
	}

	protected function getGameName() {
		return "concept";
	}


	/*
	 * setupNewGame:
   */
	protected function setupNewGame( $players, $options = [] ){
		$gameinfos = self::getGameinfos();
		$default_colors = $gameinfos['player_colors'];
		$sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
		$values = [];
		foreach( $players as $player_id => $player ){
			$color = array_shift( $default_colors );
			$values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
		}
		$sql .= implode( $values, ',' );
		self::DbQuery( $sql );
		self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
		self::reloadPlayersBasicInfos();



		// Activate first player (which is in general a good idea :) )
		$this->activeNextPlayer();
	}

	/*
	 * getAllDatas:
	 */
	protected function getAllDatas(){
		$hints = array_map(function($hint){
			return [
				'id' => (int) $hint['id'],
				'sid' => (int) $hint['symbol_id'],
				'mid' => (int) $hint['mark_id'],
			];
		}, self::getObjectListFromDB("SELECT * FROM hint") );

		return [
			'cards' => $this->cards,
			'hints' => $hints,
		];
	}

	/*
	 * getGameProgression:
	 */
	function getGameProgression(){
		return 0; // TODO
	}



	function addHint($sid, $mid){
		self::DbQuery("INSERT INTO hint (symbol_id, mark_id) VALUES ($sid, $mid)");
		$hid = self::DbGetLastId();
		$this->notifyAllPlayers('addHint', '', [
			'id' => $hid,
			'sid' => $sid,
			'mid' => $mid,
		]);
	}

////////////////////////////////////
////////////   Zombie   ////////////
////////////////////////////////////
/*
 * zombieTurn:
 *   This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
 *   You can do whatever you want in order to make sure the turn of this player ends appropriately
 */
public function zombieTurn($state, $activePlayer) {
	if (array_key_exists('zombiePass', $state['transitions'])) {
		$this->gamestate->nextState('zombiePass');
	} else {
		throw new BgaVisibleSystemException('Zombie player ' . $activePlayer . ' stuck in unexpected state ' . $state['name']);
	}
}

/////////////////////////////////////
//////////   DB upgrade   ///////////
/////////////////////////////////////
// You don't have to care about this until your game has been published on BGA.
// Once your game is on BGA, this method is called everytime the system detects a game running with your old Database scheme.
// In this case, if you change your Database scheme, you just have to apply the needed changes in order to
//   update the game database and allow the game to continue to run with your new version.
/////////////////////////////////////
/*
 * upgradeTableDb
 *  - int $from_version : current version of this game database, in numerical form.
 *      For example, if the game was running with a release of your game named "140430-1345", $from_version is equal to 1404301345
 */
public function upgradeTableDb($from_version) {
}
}
