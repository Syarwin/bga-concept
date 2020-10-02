{OVERALL_GAME_HEADER}

<div id="concept-app">
	<div id="concept-container" @mousemove="moveHintAt" @mouseup="dragHintStop" @mouseleave="dragHintStop">
		<div id="concept-guesses-container">
				<h2 v-if="isClueGiver" id="word-display">{{ word }}</h2>
				<h2>Guesses</h2>
				<ul id="concept-guesses">
					<input type="text" id="concept-guess"
						v-model="guess" :placeholder="_('Your guess')"
						v-on:keyup.enter="newGuess"
						v-if="!isClueGiver"
					/>
					<li v-for="guess in guesses"
							@click="showFeedbackChoices(guess)"
							v-bind:style="{cursor: isClueGiver && guess.pId != -1? 'pointer' : 'default' }"
							v-bind:data-feedback="guess.feedback"
							v-bind:class="{ separator : guess.pId == -1}">
						<template v-if="guess.pId != -1">
							<span v-bind:style="{ color : '#' + players[guess.pId].color }">{{ players[guess.pId].name}} </span>
							{{ decode(guess.guess) }}
						</template>
					</li>
				</ul>
		</div>

		<div id="concept-grid-container">
			<div id="concept-marks" v-show="isClueGiver">
				<div id="concept-marks-clear">
					<div id="clearAll" @click="clearHints(0)">
						<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M560 160c10.4 0 18-9.8 15.5-19.9l-24-96C549.7 37 543.3 32 536 32h-98.9l25.6 128H560zM272 32H171.5l-25.6 128H272V32zm132.5 0H304v128h126.1L404.5 32zM16 160h97.3l25.6-128H40c-7.3 0-13.7 5-15.5 12.1l-24 96C-2 150.2 5.6 160 16 160zm544 64h-20l4-32H32l4 32H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h28l20 160v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h320v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16l20-160h28c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16z"></path></svg>
					</div>
					<div v-for="mColor in 5" :data-color="mColor" @click="clearHints(mColor)">
						<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path></svg>
					</div>
				</div>
				<div id="concept-marks-container">
					<template v-for="mColor in 5">
						<div :data-color="mColor" data-type="0"
							v-bind:class="{ disabled: isMarkUsed(mColor) }"
							v-bind:disabled="isMarkUsed(mColor)"
							@mousedown="newHint(mColor, 0, $event)"></div>
						<div :data-color="mColor" data-type="1"
							@mousedown="newHint(mColor, 1, $event)"></div>
					</template>
				</div>
			</div>

			<div id="concept-grid" v-bind:style="{ borderColor: (draggedHint == null? 'transparent' : 'black') }">
				<div v-for="(symbol, id) in symbols"
	        class="concept-symbol"
	        :id="'symbol-' + id">
	        <div class="symbol-zone"></div>
	        <div class="symbol-img"></div>
	      </div>

				<div v-for="(hint, hintIndex) in hints"
					 class="concept-hint"
					 :data-color="hint.mColor"
					 :data-type="hint.mType"
					 v-bind:style="{
						 left:hint.x + 'px',
						 top:hint.y + 'px',
						 cursor: isClueGiver? 'move' : 'default'
					 }"
					 @mousedown="dragHintStart(hintIndex, $event)">
				</div>
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
			<h2>{{ decode(guessFeedback.guess) }} / {{ word }}</h2>
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
