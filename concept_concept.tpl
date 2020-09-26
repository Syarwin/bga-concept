{OVERALL_GAME_HEADER}

<div id="concept-app">
	<div id="concept-container" @mousemove="moveHintAt" @mouseup="dragHintStop" @mouseleave="dragHintStop">
		<div id="concept-marks">
			<div v-for="(mark, markIndex) in marks" :id="'mark-' + markIndex"
					v-bind:class="{ disabled: marksUses[markIndex] >= mark.m && mark.m != -1 }"
					v-bind:disabled="marksUses[markIndex] >= mark.m && mark.m != -1"
					@mousedown="newHint(markIndex, $event)"></div>
		</div>

		<div id="concept-grid">
			<div v-for="(symbol, id) in symbols"
        class="concept-symbol"
        :id="'symbol-' + id">
        <div class="symbol-zone"></div>
        <div class="symbol-img"></div>
      </div>

			<div v-for="(hint, hintIndex) in hints"
				 class="concept-hint"
				 :data-mark="hint.mid"
				 v-bind:style="{
					 left:hint.x + 'px',
					 top:hint.y + 'px',
				 }"
				 @mousedown="dragHintStart(hintIndex, $event)">
			</div>
		</div>
  </div>

  <div id="concept-card-overlay" @click="displayCard = false" v-show="card != null && displayCard">
    <div id="concept-card">
      <ul id="concept-card-easy">
        <li @onclick="selectCardWord(0,0)">{{ card[0][0] }}</li>
        <li @onclick="selectCardWord(0,1)">{{ card[0][1] }}</li>
        <li @onclick="selectCardWord(0,2)">{{ card[0][2] }}</li>
      </ul>
      <ul id="concept-card-medium">
        <li @onclick="selectCardWord(1,0)">{{ card[1][0] }}</li>
        <li @onclick="selectCardWord(1,1)">{{ card[1][1] }}</li>
        <li @onclick="selectCardWord(1,2)">{{ card[1][2] }}</li>
      </ul>
      <ul id="concept-card-hard">
        <li @onclick="selectCardWord(2,0)">{{ card[2][0] }}</li>
        <li @onclick="selectCardWord(2,1)">{{ card[2][1] }}</li>
        <li @onclick="selectCardWord(2,2)">{{ card[2][2] }}</li>
      </ul>
    </div>
  </div>
</div>

<script type="text/javascript">

</script>

{OVERALL_GAME_FOOTER}
