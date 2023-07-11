<template>
	<div class="bg-background rounded-lg p-4 drop-shadow-md w-full">
		<p class="font-medium text-xl truncate" v-if="typeof track !== 'undefined'">Track Settings • {{ track.name }}</p>
		<p class="ml-3 font-medium text-xl" v-if="typeof track === 'undefined'">Track Settings</p>
		<div class="flex justify-between items-center mt-4">
			<p class="text-xl font-medium text-gray-200">Trackname:</p>
			<TextInput v-model="trackSettings.name" class="max-w-[19rem] text-white" placeholder="Songname" pattern="^[a-zA-Z0-9äöüÄÖÜ._\-\s]+$">
			</TextInput>
		</div>
		<div class="flex justify-between items-center mt-4">
			<p class="text-xl font-medium text-gray-200">Volume:</p>
			<NumberInput v-model="trackSettings.trackvolume" class="w-32 text-white" :step="0.1" min="0.0" max="1.0"></NumberInput>
		</div>
		<div class="flex justify-between items-center mt-4">
			<p class="text-xl font-medium text-gray-200">Fade In:</p>
			<NumberInput v-model="trackSettings.fadeInDuration" class="w-32 text-white" :step="1" min="0"> </NumberInput>
		</div>
		<div class="flex justify-between items-center mt-4">
			<p class="text-xl font-medium text-gray-200">Fade Out:</p>
			<NumberInput v-model="trackSettings.fadeOutDuration" class="w-32 text-white" :step="1" min="0"> </NumberInput>
		</div>
		<div class="flex justify-between items-center mt-4">
			<p class="text-xl font-medium text-gray-200">Looping:</p>
			<CheckboxInput v-model="trackSettings.isLooping"></CheckboxInput>
		</div>
		<div class="flex justify-between items-center mt-4">
			<p class="text-xl font-medium text-gray-200">Position in playlist:</p>
			<NumberInput v-model="trackSettings.pos" class="w-32 text-white" :step="1" min="1" :max="audioPlayer.playlist.tracks.length.toString()">
			</NumberInput>
		</div>
		<div class="flex justify-end items-center mt-4">
			<button
				type="button"
				class="inline-flex w-auto justify-center rounded-md border border-transparent bg-[#404040] text-[#ff2222] px-4 py-2 text-base font-medium shadow-sm hover:bg-[#ff2222] hover:text-white focus:outline-none focus:ring-2 focus:ring-special-red-hover focus:ring-offset-2"
				@click="$refs.removePrompt.open = true">
				Remove
			</button>
			<button
				type="button"
				class="inline-flex w-auto justify-center rounded-md border border-transparent bg-electric-blue px-4 py-2 text-base font-medium text-black shadow-sm hover:bg-electric-blue-hover focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 ml-5"
				@click="saveTrackSettings">
				Save
			</button>
		</div>
	</div>
	<ConfirmationPrompt
		ref="removePrompt"
		buttonText="Delete"
		header="Do you really what to delete the track?"
		:text="'The file won`t be deleted form the playlist folder. \n But all track settings will be lost.'"
		@onConfirm="$emit('removeTrack', track.pos)">
	</ConfirmationPrompt>
</template>
<script>
import { useAudioPlayerStore } from "@/stores/audioPlayerStore.js";
import TextInput from "@/components/TextInput.vue";
import NumberInput from "@/components/NumberInput.vue";
import CheckboxInput from "@/components/CheckboxInput.vue";
import ConfirmationPrompt from "@/components/ConfirmationPrompt.vue";

export default {
	name: "TrackSettings",
	setup() {
		const audioPlayer = useAudioPlayerStore();

		return {
			audioPlayer,
		};
	},
	props: {
		track: {
			type: Object,
		},
	},
	data() {
		return {
			trackSettings: {},
		};
	},
	components: {
		TextInput,
		NumberInput,
		CheckboxInput,
		ConfirmationPrompt,
	},
	methods: {
		saveTrackSettings() {
			// Korrigiert die Position um 1, damit pos der Index im playlist.tracks Array ist
			this.trackSettings.pos -= 1;
			this.audioPlayer.changeTrackSettings(this.track, this.trackSettings);
			// Erhöht wieder, damit die Position in der Playlist bei 1 anfängt
			this.trackSettings.pos += 1;
		},
	},
	watch: {
		track(newVal) {
			if (typeof newVal !== "undefined") {
				this.trackSettings = {
					name: newVal.name,
					trackvolume: newVal.trackvolume,
					fadeInDuration: newVal.fadeInDuration,
					fadeOutDuration: newVal.fadeOutDuration,
					isLooping: newVal.isLooping,
					// +1 weil die Positionen in der Playlist bei 1 anfangen
					pos: newVal.pos + 1,
				};
			} else {
				this.trackSettings = {};
			}
		},
	},
	emits: ["removeTrack"],
};
</script>
