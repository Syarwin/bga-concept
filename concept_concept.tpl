{OVERALL_GAME_HEADER}

<div id="concept-app" @click="unselectSymbol">
	<div id="concept-container">
		<div id="concept-grid">
			<div v-for="(symbol, id) in symbols"
        class="concept-symbol"
        :id="'symbol-' + id"
        v-bind:style="{ cursor: (editing? 'pointer' : 'default') }"
        v-bind:class="{ 'active' : selectedSymbol == id }"
        @click="selectSymbol($event, id)"
        >
        <div class="symbol-zone">
          <div v-for="(nbr, mark) in hintsPerSymbol[id]"
             class="concept-hint"
             :data-mark="mark"
             v-bind:style="{
              width : getHintSize(id) + '%',
              height : getHintSize(id) + '%'
            }">
          <span class="badge" v-if="nbr > 1" v-bind:style="{ transform : 'scale(' + getBadgeSize(id) + ')' }">{{ nbr }}</span>
        </div>

        </div>

        <div class="symbol-img">
        </div>
      </div>
		</div>

    <div id="hints-only">
      <div v-for="row in organizedHints">
        <div v-for="hint in row" class="hint">
          <div class="img" :data-symbol="hint.sid"></div>
          <div class="mark" :data-mark="hint.mid">
            <span class="badge" v-if="typeof hint.n != 'undefined'">{{ hint.n }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div id="concept-marks" v-show="selectedSymbol != null && this.editing">
    <button v-for="(mark, markIndex) in marks" :id="'mark-' + markIndex"
				v-bind:class="{ disabled: marksUses[markIndex] >= mark.m && mark.m != -1 }"
				v-bind:disabled="marksUses[markIndex] >= mark.m && mark.m != -1"
				@click="selectMark(markIndex)"></button>
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
