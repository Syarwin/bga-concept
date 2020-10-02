<?php
namespace CPT;
use Concept;

/*
 * Log: a class that allows to log some actions
 *   and then fetch these actions latter
 */
class Log extends \APP_DbObject
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

    // Notify
    $players = PlayerManager::getPlayers($team);
    if(count($team) == 1){
      Concept::$instance->notifyAllPlayers('message', clienttranslate('${player_name} is now the clue giver'), [
        'player_name' => $players[0]['player_name'],
  		]);
    } else {
      Concept::$instance->notifyAllPlayers('message', clienttranslate('${player1_name} and ${player2_name} are now the clue givers'), [
        'player1_name' => $players[0]['player_name'],
        'player2_name' => $players[1]['player_name'],
  		]);
    }
  }

  public static function newCard($cardId)
  {
    self::insert('drawCard', ['card' => $cardId]);
  }

  public static function newWord($i, $j)
  {
    $card = self::getCurrentCard();
    self::insert('pickWord', ['i' => $i, 'j' => $j, 'card' => $card]);
  }


  public static function newGuess($guess, $pId)
  {
    $action = "guess";
    $actionArgs = json_encode(['guess' => $guess]);
    self::DbQuery("INSERT INTO log (`action`, `action_arg`, `player_id`) VALUES ('$action', '$actionArgs', $pId)");
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

  public static function getCurrentCard()
  {
    return self::getLastAction('drawCard')['card'];
  }

  public static function getCardsDrawn()
  {
    $actions = self::getLastActions(['drawCard']);
    return array_map(function($action){
      $arg = json_decode($action['action_arg'], true);
      return $arg['card'];
    }, $actions);
  }


  public static function getCurrentWord($pId = null)
  {
    $word = self::getLastAction('pickWord');
    if(is_null($word)) return $word;
    $team = self::getCurrentTeam();
    return (is_null($pId) || in_array($pId, $team))? $word : null;
  }

  public static function getCurrentWordId()
  {
    $action = self::getObjectFromDb("SELECT * FROM log WHERE `action` = 'pickWord' ORDER BY log_id DESC LIMIT 1");
    return $action['log_id'];
  }
}
