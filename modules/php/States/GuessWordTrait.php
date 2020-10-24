<?php
namespace CPT\States;

use Concept;
use CPT\Hint;
use CPT\Log;
use CPT\Guess;
use CPT\PlayerManager;

///////////////////////////////
/////////   Guesses   /////////
///////////////////////////////
trait GuessWordTrait {
  /*
	 * argGuessWord: display word only to the team members
	 */
	function argPlay(){
    $team = Log::getCurrentTeam();
    $elapsed = microtime(true) - floatval($this->getGameStateValue('timerMicros'));
		$data = [
			'team' => $team,
      'wordCount' => Guess::countFoundWords(),
      'word' => Log::getCurrentWord(0),
      'timer' => $elapsed,
			'_private' => []
		];

    $word = Log::getCurrentWord();
    foreach($team as $pId){
      $data['_private'][$pId] = $word;
    }

    return $data;
	}

	/*
 	 * newGuess: when someone make a guess
 	 */
	function newGuess($guess){
    if(!in_array($this->gamestate->state()['name'], ['guessWord', 'addHint'])){
      $this->notifyAllPlayers('message', '', []);
      return;
    }
    $this->newGuesserAction();

		$pId = self::getCurrentPlayerId();
		$gId = Guess::new($guess, $pId);
		$this->notifyAllPlayers('newGuess', '', [
			'id' => $gId,
			'pId' => $pId,
			'guess' => $guess,
			'feedback' => null,
		]);

    $word = Log::getCurrentWord();
    $wordTxt = $this->getCards()[$word['card']][$word['i']][$word['j']];
    if(strcmp(base64_encode($wordTxt), $guess) == 0){
      $this->notifyAllPlayers('wordFound', clienttranslate('${player_name} guessed the exact word : ${wordTxt}'), [
        'word' => $word,
        'wordTxt' => $wordTxt,
        'player_name' => self::getCurrentPlayerName(),
        'reveal' => 0,
      ]);

      $this->gamestate->nextState('exact');
    }
	}

  /*
   * checkFeedback
   */
  function checkFeedback($gId){
    if(!Guess::isOnCurrent($gId)){
      throw new \BgaUserException(_('You cannot give feedback on guess of previous words'));
    }
  }


	/*
 	 * addFeedback: when team add feedback
 	 */
	function addFeedback($gId, $feedback){
    self::checkFeedback($gId);
    $this->newTeamAction();

		Guess::feedback($gId, $feedback);
		$this->notifyAllPlayers('newFeedback', '', [
			'gId' => $gId,
			'feedback' => $feedback,
		]);
	}


	/*
 	 * wordFound: when team confirm word found
 	 */
	function wordFound($gId){
    self::checkFeedback($gId);

    // Give feedback and notify
		Guess::feedback($gId, WORD_FOUND);
    $this->notifyAllPlayers('newFeedback', '', [
      'gId' => $gId,
      'feedback' => WORD_FOUND,
    ]);

    $player = Guess::getPlayer($gId);
		$word = Log::getCurrentWord();
    $wordTxt = $this->getCards()[$word['card']][$word['i']][$word['j']];
		$this->notifyAllPlayers('wordFound', clienttranslate('${player_name} found the word ! It was : ${wordTxt}'), [
			'wordTxt' => $wordTxt,
      'word' => $word,
			'player_name' => $player['name'],
      'reveal' => 1,
		]);

    // Add a separator
		Guess::newSeparator($wordTxt);
		$this->notifyAllPlayers('newGuess', '', [
			'pId' => -1,
      'guess' => base64_encode($wordTxt),
		]);


    // Update scores
    $amount = intval(Concept::get()->getGameStateValue('optionTeam')) == ONE_PLAYER? 1 : 2;
    PlayerManager::addScore($player['id'], $amount);
    PlayerManager::addScoreTeam();
    PlayerManager::updateUi();

		$this->gamestate->nextState('found');
	}

	/*
 	 * pass: allow a player to inactive itself for turn based games
 	 */
	function pass(){
		$this->gamestate->setPlayerNonMultiactive($this->getCurrentPlayerId(), "pass");
	}
}
