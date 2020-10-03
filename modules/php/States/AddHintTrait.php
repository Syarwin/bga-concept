<?php
namespace CPT\States;

use Concept;
use CPT\Hint;
use CPT\Log;

///////////////////////////////
//////////   Hints   //////////
///////////////////////////////
trait AddHintTrait {
	function stAddHint(){
		$team = Log::getCurrentTeam();
		$this->gamestate->setPlayersMultiactive($team, '', true);
	}

	/*
	 * argAddHint: display word only to the team members
	 */
	function argAddHint(){
		return [
			'team' => Log::getCurrentTeam(),
			'_private' => [
				'active' => Log::getCurrentWord()
			]
		];
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
    Hint::move($id, $x,$y);
		$this->notifyAllPlayers('moveHint', '', [
			'id' => $id,
			'x' => $x,
			'y' => $y,
		]);
  }


  /*
   * deleteHint: delete an existing hint on the board
   */
  function deleteHint($id){
    Hint::delete($id);
		$this->notifyAllPlayers('deleteHint', '', [
			'id' => $id,
		]);
  }


	/*
   * clearHints: delete all the hints of given color
   */
  function clearHints($color){
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
}
