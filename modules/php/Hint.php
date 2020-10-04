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
    }, self::getObjectListFromDB("SELECT * FROM hint ORDER BY ordering") );
  }


  /*
 	 * addHint: add a new hint on the board
 	 */
	function add($mColor, $mType, $x, $y, $sId){
    $symbol = is_null($sId)? 'NULL' : $sId;
    $order = (int) self::getUniqueValueFromDB("SELECT ordering FROM hint ORDER BY ordering DESC LIMIT 1") + 1;
		self::DbQuery("INSERT INTO hint (mark_color, mark_type, x, y, symbol_id, ordering) VALUES ($mColor, $mType, $x, $y, $symbol, $order)");
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


  /*
 	 * order: change the order of the hints
 	 */
	function order($order){
    foreach($order as $hint){
		  self::DbQuery("UPDATE hint SET ordering = {$hint['order']} WHERE id = {$hint['hId']}");
    }
	}
}
