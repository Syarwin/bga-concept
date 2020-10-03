<?php
namespace CPT;
use Concept;

/*
 * Hint: a class that allows to store/retrieve the hints
 */
class Hint extends \APP_DbObject
{
  public static function getUiData(){
    return array_map(function($hint){
      return [
        'id'  => (int) $hint['id'],
        'mType'  => (int) $hint['mark_type'],
        'mColor' => (int) $hint['mark_color'],
        'mId'    => (int) $hint['mark_color'] * 2 + (int) $hint['mark_type'],
        'sId'   => (int) $hint['symbol_id'],
        'x'   => (int) $hint['x'],
        'y'   => (int) $hint['y'],
      ];
    }, self::getObjectListFromDB("SELECT * FROM hint") );
  }


  /*
 	 * addHint: add a new hint on the board
 	 */
	function add($mColor, $mType, $x, $y, $sId){
    $symbol = is_null($sId)? 'NULL' : $sId;
		self::DbQuery("INSERT INTO hint (mark_color, mark_type, x, y, symbol_id) VALUES ($mColor, $mType, $x, $y, $symbol)");
		return self::DbGetLastId();
	}

	/*
 	 * moveHint: move an existing hint on the board
 	 */
	function move($id, $x, $y){
		self::DbQuery("UPDATE hint SET x = $x, y = $y WHERE id = $id");
	}


	/*
 	 * deleteHint: move an existing hint on the board
 	 */
	function delete($id){
		self::DbQuery("DELETE FROM hint WHERE id = $id");
	}

  /*
 	 * clearAll: remove all hints
 	 */
	function clearAll(){
    self::DbQuery("DELETE FROM hint WHERE 1");
	}


  /*
 	 * clearColor: remove all hints of given color
 	 */
	function clearColor($color){
    self::DbQuery("DELETE FROM hint WHERE mark_color = $color");
	}
}
