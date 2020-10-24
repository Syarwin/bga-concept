<?php
namespace CPT\States;

use Concept;
use CPT\Guess;
use CPT\Hint;
use CPT\Log;
use CPT\PlayerManager;

///////////////////////////////
//////////   Hints   //////////
///////////////////////////////
trait AddHintTrait {
  function makeTeamActive($exclusive = false){
    $team = Log::getCurrentTeam();
    $this->gamestate->setPlayersMultiactive($team, '', $exclusive);
  }

  function makeGuessersActive($exclusive = false){
    $team = Log::getCurrentTeam();
    $guessers = array_values(array_filter(PlayerManager::getPlayersLeft(),
      function($pId) use ($team){ return !in_array($pId, $team); }));
    $this->gamestate->setPlayersMultiactive($guessers, '', $exclusive);
  }

  function newTeamAction(){
    $this->giveExtraTime(self::getCurrentPlayerId());
    if(self::isAsync()){
      $this->makeGuessersActive();
    }
  }

  function newGuesserAction(){
    $this->giveExtraTime(self::getCurrentPlayerId());
    if(self::isAsync()){
      $this->makeTeamActive();
    }
  }



	function stAddHint(){
    $this->makeTeamActive(true);
	}

  function stWaitingScore(){
    $this->makeTeamActive(true);
  }
  
	/*
 	 * confirmHints: allow a player to inactive itself for turn based games
 	 */
	function confirmHints(){
		$this->gamestate->setPlayerNonMultiactive($this->getCurrentPlayerId(), "confirm");
	}

  /*
   * addHint: add a new hint on the board
   */
  function addHint($mColor, $mType, $x, $y, $sId){
    $this->newTeamAction();
    $id = Hint::add($mColor, $mType, $x,$y, $sId);
		$this->notifyAllPlayers('addHint', '', [
			'id' => $id,
			'mId'=> (int) $mColor*2 + $mType,
			'mColor' => $mColor,
			'mType' => $mType,
			'x' => $x,
			'y' => $y,
			'sId' => $sId,
		]);
  }

  /*
   * moveHint: move an existing hint on the board
   */
  function moveHint($id, $x, $y){
    $this->newTeamAction();
    Hint::move($id, $x,$y);
		$this->notifyAllPlayers('moveHint', '', [
			'id' => $id,
			'x' => $x,
			'y' => $y,
		]);
  }



  /*
   * moveMark: move an existing '?!' on another symbol
   */
  function moveMark($color, $sId){
    $this->newTeamAction();
    Hint::moveMark($color, $sId);
		$this->notifyAllPlayers('moveMark', '', [
			'mColor' => $color,
			'sId' => $sId,
		]);
  }


  /*
   * deleteHint: delete an existing hint on the board
   */
  function deleteHint($id){
    $this->newTeamAction();
    Hint::delete($id);
		$this->notifyAllPlayers('deleteHint', '', [
			'id' => $id,
		]);
  }


	/*
   * clearHints: delete all the hints of given color
   */
  function clearHints($color = 0){
    $this->newTeamAction();
		if($color == 0){
			Hint::clearAll();
			$this->notifyAllPlayers('clearHints', '', []);
		}
		else {
    	Hint::clearColor($color);
			$this->notifyAllPlayers('clearColor', '', [
				'color' => $color,
			]);
		}
  }


	/*
   * orderHints: change the order of the hints
   */
	function orderHints($order){
    $this->newTeamAction();
		Hint::order($order);
		$this->notifyAllPlayers('orderHints', '', [
			'order' => $order,
		]);
	}
}
