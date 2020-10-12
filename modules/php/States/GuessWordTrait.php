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
	function stGuessWord(){
		$team = Log::getCurrentTeam();
		$guessers = array_values(array_filter(PlayerManager::getPlayersLeft(),
			function($pId) use ($team){ return !in_array($pId, $team); }));
		$this->gamestate->setPlayersMultiactive($guessers, '', true);
	}

	/*
	 * argGuessWord: display word only to the team members
	 */
	function argPlay(){
    $team = Log::getCurrentTeam();
		$data = [
			'team' => $team,
      'wordCount' => Guess::countFoundWords(),
      'word' => Log::getCurrentWord(0),
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
    if($this->gamestate->state()['name'] == 'pickWord'){
      $this->notifyAllPlayers('message', '', []);
      return;
    }

		$pId = self::getCurrentPlayerId();
		$gId = Guess::new($guess, $pId);
		$this->notifyAllPlayers('newGuess', '', [
			'id' => $gId,
			'pId' => $pId,
			'guess' => $guess,
			'feedback' => null,
		]);
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
		$this->notifyAllPlayers('wordFound', clienttranslate('${player_name} found the word ! It was : ${wordTxt}'), [
			'wordTxt' => CONCEPT_CARDS[$word['card']][$word['i']][$word['j']],
      'word' => $word,
			'player_name' => $player['name'],
		]);

    // Add a separator
		Guess::newSeparator();
		$this->notifyAllPlayers('newGuess', '', [
			'pId' => -1,
		]);


    // Update scores
    if($this->getGameStateValue('optionScoring') == COMPETITIVE){
      $amount = intval(Concept::get()->getGameStateValue('optionTeam')) == ONE_PLAYER? 1 : 2;
      PlayerManager::addScore($player['id'], $amount);
      PlayerManager::addScoreTeam();
      PlayerManager::updateUi();
    }

		$this->gamestate->nextState('found');
	}

	/*
 	 * pass: allow a player to inactive itself for turn based games
 	 */
	function pass(){
		$this->gamestate->setPlayerNonMultiactive($this->getCurrentPlayerId(), "pass");
	}
}
