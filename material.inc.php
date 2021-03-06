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
 * material.inc.php
 *
 * Concept game material description
 */

require_once("modules/php/constants.inc.php");

$this->cards = [];
$languages = ['EN','FR','NL','NO','SW','DA','FI','IT','PT','ES','JA','DE','RU','CS','RO','PL','BG','HU','EL','CN'];
foreach($languages as $l){
  require_once("modules/cards/cards-$l.inc.php");
  $className = "ConceptCards".$l;
  $this->cards[$l] = $className::$cards;
}
