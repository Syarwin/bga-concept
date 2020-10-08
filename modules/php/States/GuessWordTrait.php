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
	function argGuessWord(){
		return [
			'team' => Log::getCurrentTeam(),
			'_private' => [
				'active' => Log::getCurrentWord()
			]
		];
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
 	 * addFeedback: when team add feedback
 	 */
	function addFeedback($gId, $feedback){
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
		Guess::feedback($gId, WORD_FOUND);
		Guess::newSeparator();
		$this->notifyAllPlayers('newGuess', '', [
			'pId' => -1,
		]);

		$player = Guess::getPlayer($gId);
		$word = Log::getCurrentWord();
		$this->notifyAllPlayers('newFeedback', '', [
			'gId' => $gId,
			'feedback' => WORD_FOUND,
		]);
		$this->notifyAllPlayers('message', clienttranslate('${player_name} found the word ! It was : ${word}'), [
			'word' => CONCEPT_CARDS[$word['card']][$word['i']][$word['j']],
			'player_name' => $player['name'],
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
