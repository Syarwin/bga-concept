<?php

/*
 * ConceptGuess: a class that allows to log the guesses
 */
class ConceptGuess extends APP_GameClass
{
  public static function new($guess, $pId)
  {
    $lId = ConceptLog::getCurrentWordId();
    self::DbQuery("INSERT INTO guess (`log_id`, `player_id`, `guess`) VALUES ($lId, $pId, '$guess')");
    return self::DbGetLastId();
  }

  public static function newSeparator()
  {
    self::DbQuery("INSERT INTO guess (`log_id`, `player_id`) VALUES (-1,-1)");
  }

  public static function getCurrent()
  {
//    $lId = ConceptLog::getCurrentWordId();
//  return $lId ? self::getObjectListFromDb("SELECT id, player_id pId, guess, feedback FROM guess WHERE `log_id` = $lId ORDER BY id") : [];
    return self::getObjectListFromDb("SELECT id, player_id pId, guess, feedback FROM guess ORDER BY id DESC");
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

}
