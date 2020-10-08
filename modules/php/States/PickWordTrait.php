<?php
namespace CPT\States;

use Concept;
use CPT\Log;

/////////////////////////////////
//////////  Pick Word  //////////
/////////////////////////////////
trait PickWordTrait {
	/*
	 * argPickWord: display card only to the team members
	 */
	function argPickWord(){
		return [
			'team' => Log::getCurrentTeam(),
			'_private' => [
				'active' => Log::getCurrentCard()
			]
		];
	}


	/*
	 * pickWord: select a word on the card (i = color, j = index)
	 */
	function pickWord($i, $j){
		Log::newWord($i,$j);
    $this->clearHints();
		$this->gamestate->nextState();
	}
}
