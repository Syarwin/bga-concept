<?php
namespace CPT;
use Concept;

/*
 * Guess: a class that allows to log the guesses
 */
class Guess extends \APP_DbObject
{
  public static function new($guess, $pId)
  {
    $lId = Log::getCurrentWordId();
    $safe = addslashes($guess);
    self::DbQuery("INSERT INTO guess (`log_id`, `player_id`, `guess`) VALUES ($lId, $pId, '$safe')");
    return self::DbGetLastId();
  }

  public static function newSeparator()
  {
    self::DbQuery("INSERT INTO guess (`log_id`, `player_id`) VALUES (-1,-1)");
  }

  public static function getCurrent()
  {
//    $lId = CPT\Log::getCurrentWordId();
//  return $lId ? self::getObjectListFromDb("SELECT id, player_id pId, guess, feedback FROM guess WHERE `log_id` = $lId ORDER BY id") : [];
    return array_map(function($clue){
      return [
        'id' => (int) $clue['id'],
        'pId' => (int) $clue['player_id'],
        'guess' => stripslashes($clue['guess']),
        'feedback' => $clue['feedback'],
      ];
    }, self::getObjectListFromDb("SELECT id, player_id, guess, feedback FROM guess ORDER BY id DESC"));
  }

  public static function isOnCurrent($gId)
  {
    $word = (int) self::getUniqueValueFromDB("SELECT log_id FROM guess WHERE id = $gId OR log_id = -1 ORDER BY id DESC LIMIT 1");
    return $word != -1 && $word == Log::getCurrentWordId();
  }


  public static function feedback($gId, $feedback)
  {
    self::DbQuery("UPDATE guess SET feedback = $feedback WHERE id = $gId");
  }

  public static function getPlayer($gId)
  {
    $pId = self::getUniqueValueFromDB("SELECT player_id FROM guess WHERE id = $gId");
    return PlayerManager::getPlayer($pId);
  }

  public static function countFoundWords()
  {
    return (int) self::getUniqueValueFromDB("SELECT COUNT(id) FROM guess WHERE feedback = " . WORD_FOUND);
  }
}
