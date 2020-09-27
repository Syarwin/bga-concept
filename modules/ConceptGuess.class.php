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
  }


  public static function getCurrent()
  {
    $lId = ConceptLog::getCurrentWordId();
    return $lId ? self::getObjectListFromDb("SELECT * FROM guess WHERE `log_id` = $lId ORDER BY id DESC") : [];
  }
}
