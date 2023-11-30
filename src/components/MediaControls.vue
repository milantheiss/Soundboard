<template>
	<div class="grid grid-cols-3 gap-3 items-center w-full">
		<button
			@click="audioPlayer.skipToPrevious()"
			class="h-fit px-2 py-2 border border-transparent bg-electric-blue rounded-xl shadow-lg text-base font-medium text-black hover:bg-electric-blue-hover focus:outline-none focus:ring-2 focus:ring-electric-blue-hover focus:ring-offset-2 flex justify-center items-center">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
				<path
					d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
			</svg>
		</button>

		<span
			class="h-full px-2 py-2 border border-transparent bg-electric-blue rounded-xl shadow-lg text-base font-medium text-black hover:bg-electric-blue-hover focus:outline-none focus:ring-2 focus:ring-electric-blue-hover focus:ring-offset-2 hover:cursor-pointer flex justify-center items-center"
			@click="audioPlayer.togglePlay()">
			<button class="" v-if="!audioPlayer.isPlaying">
				<!--Play Icon-->
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
					<path
						fill-rule="evenodd"
						d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
						clip-rule="evenodd" />
				</svg>
			</button>
			<button class="" v-if="audioPlayer.isPlaying">
				<!--Pause Icon-->
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
					<path
						fill-rule="evenodd"
						d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
						clip-rule="evenodd" />
				</svg>
			</button>
		</span>

		<button
			@click="audioPlayer.skipToNext()"
			class="h-fit px-2 py-2 border border-transparent bg-electric-blue rounded-xl shadow-lg text-base font-medium text-black hover:bg-electric-blue-hover focus:outline-none focus:ring-2 focus:ring-electric-blue-hover focus:ring-offset-2 flex justify-center items-center">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
				<path
					d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
			</svg>
		</button>
	</div>
	<SeekUpdater v-model="seek" v-bind="$attrs"></SeekUpdater>
	<div @keyup.space="keyTest"></div>
</template>

<script setup>
import { MediaPlayer } from "../util/mediaPlayer";
import SeekUpdater from "./SeekUpdater.vue";
// import { register, unregisterAll } from "@tauri-apps/api/globalShortcut";
// import { writeToLogfile } from "../util/fileManager.js";
import { ref } from "vue";

const audioPlayer = new MediaPlayer();

const seek = ref(0);

//IMPORTANT Nicht final
// useHotkeys: false,
// hotkeyHasCooldown: true,
// lastHotkey: 0,
// cooldown: 750,

// Auch im Expose toggleHotkeys, useHotkeys, cooldown, hotkeyHasCooldown, lastHotkey, playTrack
defineExpose({ seek, audioPlayer });
defineEmits(["seekValue"]);

// "audioPlayer.playlist"(newVal, oldVal) {
// 	try {
// 		if (oldVal.tracks[this.audioPlayer.oldIndex].player.playing()) {
// 			this.audioPlayer.current.player.on("end", () => {
// 				this.skipToNext();
// 			});
// 			this.fade.crossfade(oldVal.tracks[this.audioPlayer.oldIndex], this.audioPlayer.current);
// 		}
// 	} catch {
// 		console.debug("Could not fade into new playlist");
// 	}
// },
// "seek"() {
// 	this.$emit("seekValue", this.seek);
// },
</script>
