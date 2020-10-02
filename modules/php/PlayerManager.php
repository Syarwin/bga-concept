<?php
namespace CPT;
use Concept;

/*
 * PlayerManager: all utility functions concerning players
 */

class PlayerManager extends \APP_DbObject
{
	public static function setupNewGame($players)	{
		self::DbQuery('DELETE FROM player');
		$gameInfos = Concept::get()->getGameinfos();
		$sql = 'INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ';

		$values = [];
		$i = 0;
		foreach ($players as $pId => $player) {
			$color = $gameInfos['player_colors'][$i];
			$canal = $player['player_canal'];
			$name = $player['player_name'];
			$avatar = addslashes($player['player_avatar']);
			$name = addslashes($player['player_name']);
			$values[] = "($pId, '$color','$canal','$name','$avatar')";
		}
		self::DbQuery($sql . implode($values, ','));
    Concept::get()->reattributeColorsBasedOnPreferences($players, $gameInfos['player_colors'] );
		Concept::get()->reloadPlayersBasicInfos();
	}


	/*
	 * getPlayer : returns the BangPlayer object for the given player ID
	 */
	public static function getPlayer($playerId)	{
		$bplayers = self::getPlayers([$playerId]);
		return $bplayers[0];
	}

	/*
	 * getPlayers : Returns array of SantoriniPlayer for all/specified player IDs
	 * if $asArrayCollection is set to true it return the result as a map $id=>array
	 */
	public static function getPlayers($playerIds = null, $asArrayCollection = false) {
		$columns = ["id", "no", "name", "color", "eliminated", "score", "zombie"];
		$sqlcolumns = [];
		foreach($columns as $col) $sqlcolumns[] = "player_$col";
		$sql = "SELECT " . implode(", ", $sqlcolumns) . " FROM player" ;
		if (is_array($playerIds)) {
			$sql .= " WHERE player_id IN ('" . implode("','", $playerIds) . "')";
		}

		if($asArrayCollection) return self::getCollectionFromDB($sql);
		else return self::getObjectListFromDB($sql);
	}

	/*
	 * getUiData : get all ui data of all players
	 */
	public static function getUiData()	{
		return self::getPlayers(null, true);
	}


  /*
	 * returns an array with positions of all living players . the values won't always be the same as player_no, but a complete sequence [0,#numberOflivingplayers)
	 */
	public static function getPlayerPositions() {
		return array_flip(self::getObjectListFromDB("SELECT player_id from player WHERE player_eliminated=0 ORDER BY player_no", true));
	}

	/**
	 * returns an array of the ids of all players left
	 */
	public static function getPlayersLeft() {
    $sql = "SELECT player_id id FROM player WHERE player_eliminated = 0 ORDER BY player_no";
		return self::getObjectListFromDB($sql, true);
	}

  public static function getEliminatedPlayers() {
		$sql = "SELECT player_id id FROM player WHERE player_eliminated = 1 ORDER BY player_no";
		return self::getObjectListFromDB($sql, true);
	}


	public static function getPlayersLeftStartingWith($pId) {
		return self::getObjectListFromDB("SELECT player_id id FROM player WHERE player_eliminated = 0 ORDER BY player_no < (SELECT player_no no FROM player WHERE player_id = $pId), player_no", true);
	}

  public static function getNextPlayer($player) {
    $players = self::getLivingPlayersStartingWith($player);
		return self::getPlayer($players[1]);
  }

  public static function getNewTeam(){
    $optionTeam = intval(Concept::get()->getGameStateValue('optionTeam'));
    $previousTeam = Log::getCurrentTeam();
    $newTeam = [];

    // First team : pick the two first players by no
    if(is_null($previousTeam)){
      $players = self::getPlayersLeft();
      $newTeam = $optionTeam == ONE_PLAYER? [$players[0]] : [$players[0], $players[1]];
    }
    // Otherwise : pick the following two
    else {
      $players = self::getPlayersLeftStartingWith($previousTeam[ONE_PLAYER? 0 : 1]);
      $newTeam = $optionTeam == ONE_PLAYER? [$players[1]] : [$players[1], $players[2]];
    }

    return $newTeam;
  }
}
