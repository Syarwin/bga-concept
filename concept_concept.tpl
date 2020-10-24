{OVERALL_GAME_HEADER}

<div id="concept-app" @click="unselectSymbol">
	<div id="concept-container">
		<div id="concept-guesses-container">
				<h2 id="current-word">
					<div id="word-counter">
					{{ wordCount }} / {{ endOfGame}}
					</div>
					<div id="word-timer" v-if="displayTimer">
						{{ formatedTimer }}
					</div>
				</h2>
				<h2 id="word-display" :data-lvl='wordLvl' v-if="word != null"	>{{ word }}</h2>
				<h2>{{ _("Guesses") }}</h2>
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
							v-bind:class="{ separator : guess.pId == -1, needFeedback : isClueGiver && guess.id > lastSeparatorId && guess.feedback == null }">
						<template v-if="guess.pId != -1">
							<span v-bind:style="{ color : '#' + players[guess.pId].color }">{{ players[guess.pId].name}} </span>
						</template>
							{{ decode(guess.guess) }}
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
			<div id="hints-only-container" v-if="!isClueGiver">
				<div id="hints-only" v-bind:class="{ 'alone': !displayGrid }">
					<ul v-for="row in organizedHints">
						<li class="hint" v-for="hint in row" :key="hint.id">
							<div class="img" :data-symbol="hint.sId" :id="'hints-only-' + hint.id">
								<div class="mark" :data-color="hint.mColor" :data-type="hint.mType">
									<span class="badge badge-secondary" v-if="hint.n > 1">{{ hint.n }}</span>
								</div>
							</div>
						</li>
					</ul>
				</div>

				<div id="toggle-grid">
					<div id="grid-switch">
						<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M288 144a110.94 110.94 0 0 0-31.24 5 55.4 55.4 0 0 1 7.24 27 56 56 0 0 1-56 56 55.4 55.4 0 0 1-27-7.24A111.71 111.71 0 1 0 288 144zm284.52 97.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400c-98.65 0-189.09-55-237.93-144C98.91 167 189.34 112 288 112s189.09 55 237.93 144C477.1 345 386.66 400 288 400z"></path></svg>
						<input type="checkbox" class="checkbox" id="chk-grid" :checked="!displayGrid" @change="toggleGrid()"/>
            <label class="label" for="chk-grid">
              <div class="ball"></div>
            </label>
						<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M634 471L36 3.51A16 16 0 0 0 13.51 6l-10 12.49A16 16 0 0 0 6 41l598 467.49a16 16 0 0 0 22.49-2.49l10-12.49A16 16 0 0 0 634 471zM296.79 146.47l134.79 105.38C429.36 191.91 380.48 144 320 144a112.26 112.26 0 0 0-23.21 2.47zm46.42 219.07L208.42 260.16C210.65 320.09 259.53 368 320 368a113 113 0 0 0 23.21-2.46zM320 112c98.65 0 189.09 55 237.93 144a285.53 285.53 0 0 1-44 60.2l37.74 29.5a333.7 333.7 0 0 0 52.9-75.11 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64c-36.7 0-71.71 7-104.63 18.81l46.41 36.29c18.94-4.3 38.34-7.1 58.22-7.1zm0 288c-98.65 0-189.08-55-237.93-144a285.47 285.47 0 0 1 44.05-60.19l-37.74-29.5a333.6 333.6 0 0 0-52.89 75.1 32.35 32.35 0 0 0 0 29.19C89.72 376.41 197.08 448 320 448c36.7 0 71.71-7.05 104.63-18.81l-46.41-36.28C359.28 397.2 339.89 400 320 400z"></path></svg>
          </div>
				</div>
			</div>


			<div id="concept-grid-fixed-width" v-show="isClueGiver || displayGrid" v-bind:style="{ 'transform' : 'scale(' + scale +')', 'width' : '1100px', 'height' : (800*scale) + 'px' }">
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
						<button type="button" @touchstart="hint.mType == 0? clearHints(hint.mColor) : removeHint(hint.id)" @click="hint.mType == 0? clearHints(hint.mColor) : removeHint(hint.id)" v-if="isClueGiver">
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
								@mousedown="newHint(mColor, 0, $event)"
                @touchstart="newHint(mColor, 0, $event)"></div>
							<div :data-color="mColor" data-type="1"
								@mousedown="newHint(mColor, 1, $event)"
                @touchstart="newHint(mColor, 1, $event)"></div>
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
						 @mousedown="dragHintStartMouse(hintIndex, $event)"
 						 @touchstart="dragHintStartTouch(hintIndex, $event)">
					</div>
				</div>
			</div>
		</div>
		<!-- END free -->

  </div>

  <div id="concept-card-overlay" @click="displayCard = false" v-if="card != null && displayCard && !displayReveal">
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
			<h2>
        <span v-bind:style="{ color : '#' + players[guessFeedback.pId].color }">{{ players[guessFeedback.pId].name}} </span>
        :
        {{ decode(guessFeedback.guess) }}</h2>
			<ul>
        <li @click="addFeedback(0)" id="concept-feedback-0">
					<div class="feedback-smiley"></div>
					{{ _("No way!") }}
				</li>
        <li @click="addFeedback(1)" id="concept-feedback-1">
					<div class="feedback-smiley"></div>
					{{ _("Almost...") }}
				</li>
				<li @click="wordFound()" id="concept-feedback-2">
					<div class="feedback-smiley"></div>
					{{ _("Correct!") }}
				</li>
      </ul>
			<h2>{{ _("The correct word: ") + word }}</h2>
    </div>
  </div>


	<div id="concept-card-reveal" @click="displayReveal = false" v-if="displayReveal">
		<div id="concept-reveal-container">
			<div id="concept-reveal-back"><div></div></div>
			<div id="concept-reveal-front">
				<div>
					<div id="concept-reveal-smiley" v-bind:class="{ 'found' : revealSmiley }"></div>
					<h2 v-html="revealMessage"></h2>
					<div id="concept-reveal-word" :data-lvl="revealLvl">
						{{ revealWord }}
					</div>
				</div>
			</div>
		</div>
	</div>

</div>

{OVERALL_GAME_FOOTER}
