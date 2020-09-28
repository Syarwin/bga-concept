{OVERALL_GAME_HEADER}

<div id="concept-app">
	<div id="concept-container" @mousemove="moveHintAt" @mouseup="dragHintStop" @mouseleave="dragHintStop">
		<div id="concept-guesses-container">
				<h2 v-if="isCurrentPlayerActive()" id="word-display">{{ word }}</h2>
				<h2>Guesses</h2>
				<ul id="concept-guesses">
					<input type="text" id="concept-guess"
						v-model="guess" :placeholder="_('Your guess')"
						v-on:keyup.enter="newGuess"
						v-if="!isCurrentPlayerActive()"
					/>
					<li v-for="guess in guesses"
							@click="if(guess.pId != -1) showFeedbackChoices(guess)"
							v-bind:style="{cursor: isCurrentPlayerActive && guess.pId != -1? 'pointer' : 'default' }"
							v-bind:data-feedback="guess.feedback"
							v-bind:class="{ separator : guess.pId == -1}">
						<v-template v-if="guess.pId != -1">
							<span v-bind:style="{ color : '#' + players[guess.pId].color }">{{ players[guess.pId].name}} </span>
							{{ guess.guess }}
						</v-template>
					</li>
				</ul>
		</div>


		<div id="concept-marks" v-show="isCurrentPlayerActive">
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

  <div id="concept-card-overlay" @click="displayCard = false" v-if="card != null && displayCard">
    <div id="concept-card">
      <ul id="concept-card-easy">
        <li @click="selectCardWord(0,0)">{{ card[0][0] }}</li>
        <li @click="selectCardWord(0,1)">{{ card[0][1] }}</li>
        <li @click="selectCardWord(0,2)">{{ card[0][2] }}</li>
      </ul>
      <ul id="concept-card-medium">
        <li @click="selectCardWord(1,0)">{{ card[1][0] }}</li>
        <li @click="selectCardWord(1,1)">{{ card[1][1] }}</li>
        <li @click="selectCardWord(1,2)">{{ card[1][2] }}</li>
      </ul>
      <ul id="concept-card-hard">
        <li @click="selectCardWord(2,0)">{{ card[2][0] }}</li>
        <li @click="selectCardWord(2,1)">{{ card[2][1] }}</li>
        <li @click="selectCardWord(2,2)">{{ card[2][2] }}</li>
      </ul>
    </div>
  </div>


	<div id="concept-feedback-overlay" @click="displayFeedback = false" v-if="displayFeedback">
    <div id="concept-feedback-container">
			<h2>{{ guessFeedback.guess }} / {{ word }}</h2>
			<ul>
        <li @click="addFeedback(0)" id="concept-feedback-0"></li>
        <li @click="addFeedback(1)" id="concept-feedback-1"></li>
        <li @click="addFeedback(2)" id="concept-feedback-2"></li>
        <li @click="addFeedback(3)" id="concept-feedback-3"></li>
        <li @click="addFeedback(4)" id="concept-feedback-4"></li>

				<li @click="wordFound()" id="word-found"></li>
      </ul>
    </div>
  </div>

</div>

<script type="text/javascript">

</script>

{OVERALL_GAME_FOOTER}
