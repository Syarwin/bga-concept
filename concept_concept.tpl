{OVERALL_GAME_HEADER}

<div id="concept-app" @click="unselectSymbol">
	<div id="concept-container">
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


<!-- BEGIN snapped -->
		<transition name="fade">
			<div key="concept-popper" id="concept-marks-popper" v-show="selectedSymbol != null && this.isClueGiver">
				<template v-for="mColor in 5">
					<div :data-color="mColor" data-type="0"
						@click="addHint(mColor,0)"></div>
					<div :data-color="mColor" data-type="1"
						v-bind:class="{ disabled: !isMarkUsed(mColor) }"
						@click="addHint(mColor,1)"></div>
				</template>
			</div>
		</transition>

		<div id="concept-grid-container">
			<div id="hints-only" v-if="!isClueGiver" v-show="hints.length > 0">
				<ul v-for="row in organizedHints">
					<li class="hint" v-for="hint in row" :key="hint.id">
						<div class="img" :data-symbol="hint.sId">
							<div class="mark" :data-color="hint.mColor" :data-type="hint.mType">
								<span class="badge badge-secondary" v-if="hint.n > 1">{{ hint.n }}</span>
							</div>
						</div>
					</li>
				</ul>
			</div>


			<div id="concept-grid-fixed-width" v-bind:style="{ 'transform' : 'scale(' + scale +')', 'width' : '1100px' }">
				<div id="concept-grid" v-bind:style="{ borderColor: (draggedHint == null? 'transparent' : 'black') }">
					<div v-for="(symbol, id) in symbols"
						class="concept-symbol"
						:id="'symbol-' + id"
	        	v-bind:class="{ 'active' : selectedSymbol == id }"
						v-bind:style="{ 'cursor' : isClueGiver? 'pointer' : 'default' }"
						@click="selectSymbol($event, id)">
						<div class="symbol-zone">
		          <div v-for="(nbr, mark) in hintsPerSymbol[id]"
		             class="concept-hint"
		             :data-color="parseInt(mark/2)"
								 :data-type="mark % 2"
		             v-bind:style="{
		              width : getHintSize(id) + '%',
		              height : getHintSize(id) + '%'
		            }">
		            <span class="badge" v-if="nbr > 1" v-bind:style="{ transform : 'scale(' + getBadgeSize(id) + ')' }">{{ nbr }}</span>
		          </div>
						</div>
						<div class="symbol-img"></div>
					</div>
				</div>
			</div>

		</div>

		<div id="hints" v-if="isClueGiver">
			<draggable class="list-group" tag="ul" v-model="hints" v-bind="dragOptions" @end="reorderingHints">
				<transition-group>
					<li class="hint" v-for="(hint, index) in hints" :key="hint.id" v-bind:style="{cursor: isClueGiver? 'move':'default'}">
						<div class="img" :data-symbol="hint.sId">
							<div class="mark" :data-color="hint.mColor" :data-type="hint.mType"></div>
						</div>
						<button type="button" @click="hint.mType == 0? clearHints(hint.mColor) : removeHint(hint.id)" v-if="isClueGiver">
							<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"></path></svg>
						</button>
					</li>
				</transition-group>
			</draggable>
		</div>
<!-- END snapped -->


<!-- BEGIN free -->
		<div id="concept-grid-container" class="free">
			<div id="concept-grid-fixed-width" v-bind:style="{ 'transform' : 'scale(' + scale +')', 'width' : '1260px' }">
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
		<!-- END free -->

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
				<li @click="wordFound()" id="concept-feedback-2"></li>
      </ul>
    </div>
  </div>
</div>

{OVERALL_GAME_FOOTER}
