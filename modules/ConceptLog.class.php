<?php

/*
 * ConceptLog: a class that allows to log some actions
 *   and then fetch these actions latter
 */
class ConceptLog extends APP_GameClass
{
////////////////////////////////
////////////////////////////////
//////////   Adders   //////////
////////////////////////////////
////////////////////////////////

  /*
   * insert: add a new log entry
   * params:
   *   - $playerId: the player who is making the action
   *   - $cardId : the card whose is making the action
   *   - string $action : the name of the action
   *   - array $args : action arguments (eg space)
   */
  public static function insert($action, $args = [])
  {
    $actionArgs = json_encode($args);
    self::DbQuery("INSERT INTO log (`action`, `action_arg`) VALUES ('$action', '$actionArgs')");
  }


  public static function newTeam($team)
  {
    self::insert('startRound', ['team' => $team]);
  }

  public static function newCard($cardId)
  {
    self::insert('drawCard', ['card' => $cardId]);
  }


/////////////////////////////////
/////////////////////////////////
//////////   Getters   //////////
/////////////////////////////////
/////////////////////////////////
  /*
   * getLastActions : get works and actions of player (used to cancel previous action)
   */
  public static function getLastActions($actions = [], $pId = null)
  {
    $player = is_null($pId)? "" : "AND `player_id` = '$pId'";
    $actionsNames = "'" . implode("','", $actions) . "'";

    return self::getObjectListFromDb("SELECT * FROM log WHERE `action` IN ($actionsNames) $player ORDER BY log_id DESC");
  }

  public static function getLastAction($action, $pId = null)
  {
    $actions = self::getLastActions([$action], $pId);
    return count($actions) > 0 ? json_decode($actions[0]['action_arg'], true) : null;
  }


  public static function getCurrentTeam()
  {
    $action = self::getLastAction('startRound');
    return is_null($action)? null : $action['team'];
  }


  public static function getCardsDrawn()
  {
    $actions = self::getLastActions(['drawCard']);
    return array_map(function($action){
      $arg = json_decode($action['action_arg'], true);
      return $arg['card'];
    }, $actions);
  }
}
