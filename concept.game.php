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

use CPT\PlayerManager;
use CPT\Guess;
use CPT\Log;

$swdNamespaceAutoload = function ($class) {
    $classParts = explode('\\', $class);
    if ($classParts[0] == 'CPT') {
        array_shift($classParts);
        $file = dirname(__FILE__) . "/modules/php/" . implode(DIRECTORY_SEPARATOR, $classParts) . ".php";
        if (file_exists($file)) {
            require_once($file);
        }
    }
};
spl_autoload_register($swdNamespaceAutoload, true, true);


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );


class Concept extends Table
{
	use CPT\States\PickWordTrait;
	use CPT\States\AddHintTrait;
	use CPT\States\GuessWordTrait;

	public static $instance = null;
	public function __construct() {
		parent::__construct();
		self::$instance = $this;

		self::initGameStateLabels([
			'optionTeam' => OPTION_TEAM_SIZE,
			'optionHint' => OPTION_HINT_MODE,
			'optionEOG' => OPTION_EOG_SCORE,
			'timerMicros' => 10,
		]);
	}
	public static function get(){
		return self::$instance;
	}


	protected function getGameName() {
		return "concept";
	}


	/*
	 * setupNewGame:
   */
	protected function setupNewGame( $players, $options = [] ){
		PlayerManager::setupNewGame($players);
    self::setGameStateInitialValue('timerMicros', -1);
		$this->activeNextPlayer();
	}


	/*
	 * getAllDatas:
	 */
	public function getCards(){
		$lId = self::getGameLanguage();
		$codes = [
			1 => 'EN',	2 => 'FR', 3 => 'IT',	4 => 'DE',	5 => 'ES',	6 => 'PT',
			7 => 'RU', 	8 => 'EL', 9 => 'DA',	10 => 'CS',	11 => 'FI',	12 => 'NL',	13 => 'PL',
			14 => 'HU', 15 => 'JA',	16 => 'NO',	17 => 'RO',	18 => 'BG',	19 => 'CN',
		];
 		return $this->cards[$codes[$lId]];
 	}


	protected function getAllDatas(){
		$start = floatval($this->getGameStateValue('timerMicros'));
		return [
			'mode' => $this->getGameStateValue('optionHint') == FREE? 'free' : 'snapped',
			'cards' => $this->getCards(),
			'hints' => CPT\Hint::getUiData(),
			'players' => CPT\PlayerManager::getUiData(),
			'team' => CPT\Log::getCurrentTeam(),
			'word' => CPT\Log::getCurrentWord(self::getCurrentPlayerId()),
			'wordCount' => CPT\Guess::countFoundWords(),
			'endOfGame' => $this->getEndOfGameCondition(),
			'guesses' => CPT\Guess::getCurrent(),
			'timer' => $start == -1? null : (microtime(true) - $start),
		];
	}


	/*
	 * getGameProgression:
	 */
	function getGameProgression(){
		$eog = $this->getEndOfGameCondition();
		return $eog == -1? 50 : ((int) 100 * CPT\Guess::countFoundWords() / $eog);
	}

	function getEndOfGameCondition(){
		if($this->getGameStateValue('optionEOG') == INFINITE)
			return -1;

		$nPlayers = count(CPT\PlayerManager::getPlayers());
		if($this->getGameStateValue('optionEOG') == SHORT)
		 	return $nPlayers;
		else
			return $nPlayers <= 6 ? 12 : (2*$nPlayers);
	}


	////////////////////////////////////
	//////////   Next round   //////////
	////////////////////////////////////
	/*
	 * stNextRound: determine who is gonna choose a word to guess
	 */
	public function stNextRound(){
		if(CPT\Guess::countFoundWords() == $this->getEndOfGameCondition()){
			$this->gamestate->nextState('endGame');
			return;
		}

		// Keep only cards not played yet, and draw a random on
		$previousCards = CPT\Log::getCardsDrawn();
		$cards = array_values(array_filter(array_keys($this->getCards()), function($cardId) use ($previousCards){
			return !in_array($cardId, $previousCards);
		}));
		$newCardIndex = bga_rand(0, count($cards) - 1);
		$newCard = $cards[$newCardIndex];
		CPT\Log::newCard($newCard);

		$newTeam = CPT\PlayerManager::getNewTeam();
		CPT\Log::newTeam($newTeam);
		$this->gamestate->setPlayersMultiactive($newTeam, 'startRound', true);
		CPT\PlayerManager::resetFlag();
		$this->gamestate->nextState('startRound');
	}


	public function giveUp(){
		$continue = CPT\PlayerManager::giveUp(self::getCurrentPlayerId());
		if(!$continue){
			$word = CPT\Log::getCurrentWord();
	    $wordTxt = $this->getCards()[$word['card']][$word['i']][$word['j']];
			$this->notifyAllPlayers('wordFound', clienttranslate('Everyone gave up, the word was : ${wordTxt}'), [
				'wordTxt' => $wordTxt,
	      'word' => $word,
			]);

	    // Add a separator
			Guess::newSeparator($wordTxt);
			$this->notifyAllPlayers('newGuess', '', [
				'pId' => -1,
	      'guess' => base64_encode($wordTxt),
			]);

			$this->gamestate->nextState('giveup');
		}
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
			$this->gamestate->nextState('giveup');
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
