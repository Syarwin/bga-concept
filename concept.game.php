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


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );


class Concept extends Table
{
	public static $instance = null;
	public function __construct() {
		parent::__construct();
		self::$instance = $this;

		self::initGameStateLabels([
			'optionTeam' => OPTION_TEAM_SIZE,
		]);
	}

	protected function getGameName() {
		return "concept";
	}


	/*
	 * setupNewGame:
   */
	protected function setupNewGame( $players, $options = [] ){
		PlayerManager::setupNewGame($players);

		$this->activeNextPlayer();
	}


	/*
	 * getAllDatas:
	 */
	protected function getAllDatas(){
		$hints = array_map(function($hint){
			return [
				'id'  => (int) $hint['id'],
				'mid' => (int) $hint['mark_id'],
				'x'   => (int) $hint['x'],
				'y'   => (int) $hint['y'],
			];
		}, self::getObjectListFromDB("SELECT * FROM hint") );

		return [
			'cards' => CONCEPT_CARDS,
			'hints' => $hints,
			'players' => PlayerManager::getUiData(),
			'team' => ConceptLog::getCurrentTeam(),
			'word' => ConceptLog::getCurrentWord(self::getCurrentPlayerId()),
			'guesses' => ConceptGuess::getCurrent(),
		];
	}



	/*
	 * getGameProgression:
	 */
	function getGameProgression(){
		return 0; // TODO
	}


////////////////////////////////////
//////////   Next round   //////////
////////////////////////////////////
	/*
	 * stNextRound: determine who is gonna choose a word to guess
	 */
	function stNextRound(){
    $optionTeam = intval(self::getGameStateValue('optionTeam'));
		$previousTeam = ConceptLog::getCurrentTeam();
		$newTeam = [];

		// First team : pick the two first players by no
		if(is_null($previousTeam)){
			$players = PlayerManager::getPlayersLeft();
			$newTeam = $optionTeam == ONE_PLAYER? [$players[0]] : [$players[0], $players[1]];
		}
		// Otherwise : pick the following two
		else {
			$players = PlayerManager::getPlayersLeftStartingWith($previousTeam[1]);
			$newTeam = $optionTeam == ONE_PLAYER? [$players[1]] : [$players[1], $players[2]];
		}

		ConceptLog::newTeam($newTeam);
		$this->gamestate->setPlayersMultiactive($newTeam, 'startRound', true);
		$this->gamestate->nextState('startRound');
	}


////////////////////////////////////
//////////   Start round   //////////
////////////////////////////////////
// Draw a card and let the team choose a word

	/*
	 * stStartRound: draw a new card
	 */
	function stStartRound(){
		// Keep only cards not played yet, and draw a random on
		$previousCards = ConceptLog::getCardsDrawn();
		$cards = array_values(array_filter(array_keys(CONCEPT_CARDS), function($cardId) use ($previousCards){
			return !in_array($cardId, $previousCards);
		}));
		$newCardIndex = bga_rand(0, count($cards) - 1);
		$newCard = $cards[$newCardIndex];
		ConceptLog::newCard($newCard);
	}

	/*
	 * argStartRound: display card only to the team members
	 */
	function argStartRound(){
		return [
			'_private' => [
				'active' => ConceptLog::getCurrentCard()
			]
		];
	}


	/*
	 * pickWord: select a word on the card (i = color, j = index)
	 */
	function pickWord($i, $j){
		ConceptLog::newWord($i,$j);
		$this->gamestate->nextState();
	}


	/*
	 * argGuessWord: display word only to the team members
	 */
	function argGuessWord(){
		return [
			'_private' => [
				'active' => ConceptLog::getCurrentWord()
			]
		];
	}


///////////////////////////////
//////////   Hints   //////////
///////////////////////////////
	/*
 	 * addHint: add a new hint on the board
 	 */
	function addHint($mid, $x, $y){
		self::DbQuery("INSERT INTO hint (mark_id, x, y) VALUES ($mid, $x, $y)");
		$hid = self::DbGetLastId();
		$this->notifyAllPlayers('addHint', '', [
			'id' => $hid,
			'mid' => $mid,
			'x' => $x,
			'y' => $y,
		]);
	}

	/*
 	 * moveHint: move an existing hint on the board
 	 */
	function moveHint($id, $x, $y){
		self::DbQuery("UPDATE hint SET x = $x, y = $y WHERE id = $id");
		$this->notifyAllPlayers('moveHint', '', [
			'id' => $id,
			'x' => $x,
			'y' => $y,
		]);
	}


	/*
 	 * deleteHint: move an existing hint on the board
 	 */
	function deleteHint($id){
		self::DbQuery("DELETE FROM hint WHERE id = $id");
		$this->notifyAllPlayers('deleteHint', '', [
			'id' => $id,
		]);
	}


///////////////////////////////
/////////   Guesses   /////////
///////////////////////////////
	/*
 	 * newGuess: when someone make a guess
 	 */
	function newGuess($guess){
		$pId = self::getCurrentPlayerId();
		$gId = ConceptGuess::new($guess, $pId);
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
		ConceptGuess::feedback($gId, $feedback);
		$this->notifyAllPlayers('newFeedback', '', [
			'gId' => $gId,
			'feedback' => $feedback,
		]);
	}


	/*
 	 * wordFound: when team confirm word found
 	 */
	function wordFound($gId){
		ConceptGuess::feedback($gId, WORD_FOUND);
		ConceptGuess::newSeparator();
		$this->notifyAllPlayers('newGuess', '', [
			'pId' => -1,
		]);

		$player = ConceptGuess::getPlayer($gId);
		$word = ConceptLog::getCurrentWord();
		$this->notifyAllPlayers('newFeedback', '', [
			'gId' => $gId,
			'feedback' => WORD_FOUND,
		]);
		$this->notifyAllPlayers('message', clienttranslate('${player_name} found the word ! It was : ${word}'), [
			'word' => CONCEPT_CARDS[$word['card']][$word['i']][$word['j']],
			'player_name' => $player['player_name'],
		]);

		$this->gamestate->nextState('found');
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
		$this->gamestate->nextState('zombiePass');
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
