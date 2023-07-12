<template>
	<div ref="window" @click="$refs.ctxMenu.close()" class="font-poppins font-normal text-white p-4 bg-background-dark-gray flex flex-col gap-4">
		<!--Preset & Playlist Selector-->
		<div class="grid grid-cols-2 gap-4 items-center">
			<div class="flex justify-start items-center mx-4">
				<span class="bg-background-dark-gray">
					<SelectList v-model="_selectedPreset" defaultValue="Select a preset" :options="presets" class="w-64"> </SelectList>
				</span>
				<button
					@click="this.$refs.createPresetPrompt.open = true"
					class="min-w-fit h-fit inline-flex justify-center ml-6 px-3 py-2 border border-transparent bg-electric-blue rounded-md shadow-sm text-base font-medium text-black hover:bg-electric-blue-hover focus:outline-none focus:ring-2 focus:ring-electric-blue-hover focus:ring-offset-2">
					Create Preset
				</button>
			</div>

			<button
				@click="
					() => {
						if (!audioPlayer.isPlaying) addPlaylistToPreset();
					}
				"
				class="ml-auto mr-4 min-w-fit h-fit inline-flex justify-center px-2 py-2 border border-transparent bg-electric-blue rounded-md shadow-sm text-base font-medium text-black hover:bg-electric-blue-hover focus:outline focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2"
				:class="{ 'bg-[#404040] hover:bg-[#404040] cursor-default focus:ring-0 focus:ring-offset-0': audioPlayer.isPlaying }">
				Add Playlist
			</button>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<!--Tracksettings Card-->
			<TrackSettings :track="audioPlayer.playlist.tracks[trackSettingsIndex]" @removeTrack="removeTrack(trackSettingsIndex)"></TrackSettings>

			<!--Playlist Card-->
			<div class="bg-background rounded-lg p-4 drop-shadow-md row-span-2 w-full h-full flex flex-col">
				<span class="flex justify-start items-end gap-4">
					<span class="flex items-center gap-4">
						<!--Refresh Icon-->
						<span @click="reloadPlaylist" :class="reloadSpin ? 'animate-reloadSpin' : ''" @animationend="reloadSpin = false" class="w-7 h-7">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
							</svg>
						</span>
						<span class="text-xl bg-background">
							<SelectList
								ref="selectPlaylist"
								v-model="_selectedPlaylist"
								defaultValue="Select a playlist"
								:options="preset.playlists"
								class="max-w-[19rem] truncate"></SelectList>
						</span>
					</span>
					<button
						@click="$refs.addSongPrompt.open = true"
						class="w-[123px] px-3 py-2 ml-auto h-fit border border-transparent bg-electric-blue rounded-md text-base font-medium text-black hover:bg-electric-blue-hover focus:outline-none focus:ring-2 focus:ring-electric-blue-hover focus:ring-offset-2">
						Add Song
					</button>
				</span>
				<div class="flex flex-col overflow-y-auto h-[26rem] pb-4 mt-4">
					<div
						v-for="(track, index) in audioPlayer.playlist?.tracks"
						:key="track.pos"
						@dblclick="playTrack(index)"
						@click.right="
							(event) => {
								$refs.ctxMenu.open(event);
								ctxMenuOnIndex = index;
							}
						"
						@click="trackSettingsIndex = index"
						class="flex justify-between items-center rounded-lg cursor-pointer bg-[#404040] px-2 py-1 font-normal hover:bg-[#383838]"
						:class="{
							'mr-2': audioPlayer.playlist?.tracks.length > 8,
							'bg-[#00D7FF] hover:bg-[#00c3e6] text-black font-bold': index === audioPlayer?.currentIndex,
							'mb-2': index + 1 !== audioPlayer.playlist.tracks.length,
						}">
						<p class="text-lg">
							{{ index + 1 }}: <span class="italic"> {{ track.name }} </span>
						</p>
					</div>
				</div>
			</div>

			<!--Devtools Card-->
			<div
				class="bg-background p-4 rounded-lg w-full flex justify-between items-center"
				:class="{ 'bg-developer-yellow bg-opacity-10': $refs.mediaControls?.useHotkeys }">
				<button
					@click="toggleHotkeys"
					class="w-fit px-1 sm:px-3 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm md:text-base font-medium text-black focus:outline-none focus:ring-2 focus:ring-offset-2"
					:class="
						$refs.mediaControls?.useHotkeys
							? 'bg-developer-yellow hover:hover:bg-yellow-700 focus:ring-developer-yellow'
							: 'bg-electric-blue hover:bg-electric-blue-hover focus:ring-electric-blue'
					">
					Toggle Hotkeys
				</button>
				<button
					@click="nextPlaylist"
					class="w-fit px-1 sm:px-3 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm md:text-base font-medium text-black focus:outline-none focus:ring-2 focus:ring-offset-2 bg-electric-blue hover:bg-electric-blue-hover focus:ring-electric-blue">
					Next Playlist
				</button>
			</div>

			<!--Media Controls Card-->
			<div
				class="grid grid-cols-3 gap-x-2 items-center col-span-2 bg-background rounded-lg px-4 pt-4 drop-shadow-md h-fit w-full"
				ref="mediaControlsCard"
				@mouseup="(event) => detectMouseUp(event)">
				<span class="w-full text-2xl font-medium col-span-2">
					<p v-if="typeof audioPlayer.current !== 'undefined'" class="truncate">
						{{ audioPlayer.current.pos + 1 }}: <span class="italic"> {{ audioPlayer.current.name }} </span>
					</p>
					<p v-if="typeof audioPlayer.current === 'undefined'">No track loaded.</p>
					<!--TODO Seek Bar hinzufügen-->
				</span>
				<MediaControls @seekValue="(val) => this.updateSeekbarHandle(val)" ref="mediaControls" class="w-full"> </MediaControls>
				<!--Seek Bar-->
				<div
					class="h-12 items-center col-span-3 hover:cursor-pointer justify-center grid grid-cols-6 sm:grid-cols-10"
					ref="seekbarCard"
					@click="(event) => getClickPosition(event)"
					@mousedown="(event) => detectMouseDown(event)">
					<span class="text-lg mr-2" ref="currentSeek">{{ convertTime(seekbar.seek) }}</span>

					<div ref="seekbar" class="block h-1 relative rounded-full bg-gray-500 w-full col-span-4 sm:col-span-8">
						<div :style="'width: ' + seekbar.progress + '%'" class="absolute inset-0 rounded-full bg-electric-blue"></div>
						<div :style="'left: ' + (seekbar.progress - 0.9) + '%'" class="absolute bg-white rounded-full -top-1.5 w-4 h-4"></div>
					</div>

					<span class="text-lg ml-2 text-right">{{ convertTime(seekbar.seek - audioPlayer.current?.player.duration()) }}</span>
				</div>
			</div>
		</div>

		<!--
			<span class="flex justify-start items-center" @click="showDeveloperTools = !showDeveloperTools">
				<span v-show="!showDeveloperTools" class="text-developer-yellow flex items-center"
				:class="$refs.mediaControls.useHotkeys ? 'text-lime-500' : ''">
				<!-Show More Icon->
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
					class="w-7 h-7">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
				</svg>
		
				</span>
				<span v-show="showDeveloperTools" class="text-developer-yellow flex items-center"
				:class="$refs.mediaControls.useHotkeys ? 'text-lime-500' : ''">
				<!-Show Less Icon->
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
					class="w-7 h-7">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
				</svg>
				</span>
			</span>
		-->

		<ContextMenu ref="ctxMenu">
			<ul>
				<li @click="trackSettingsIndex = ctxMenuOnIndex" class="mb-2 hover:bg-gray-300 hover:ring-8 ring-gray-300 rounded-sm">
					<span class="flex items-center"
						><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
						</svg>
						Edit</span
					>
				</li>
				<li
					@click="audioPlayer.decreaseTrackPosition(audioPlayer.playlist.tracks[ctxMenuOnIndex])"
					class="mb-2 hover:bg-gray-300 hover:ring-8 ring-gray-300 rounded-sm">
					<span class="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
						</svg>
						Move up</span
					>
				</li>
				<li
					@click="audioPlayer.increaseTrackPosition(audioPlayer.playlist.tracks[ctxMenuOnIndex])"
					class="mb-2 hover:bg-gray-300 hover:ring-8 ring-gray-300 rounded-sm">
					<span class="flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
						</svg>
						Move down
					</span>
				</li>
				<li @click="$refs.confirmTrackRemoval.open = true" class="hover:bg-gray-300 hover:ring-8 ring-gray-300 rounded-sm">
					<span class="flex items-center"
						><svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6 mr-2 text-special-red hover:text-special-red-hover">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
						</svg>
						Remove</span
					>
				</li>
			</ul>
		</ContextMenu>
		<ErrorPrompt ref="playerError"></ErrorPrompt>
		<ConfirmationPrompt
			ref="confirmTrackRemoval"
			buttonText="Delete"
			header="Do you really what to delete the track?"
			:text="'The file won`t be deleted form the playlist folder. \n But all track settings will be lost.'"
			@onConfirm="removeTrack(ctxMenuOnIndex)">
		</ConfirmationPrompt>
		<PromptDialog
			ref="createPresetPrompt"
			@onCommit="(name) => createPreset(name)"
			header="Name the new preset..."
			text="* The name has to be unique."
			:validator-regex="/[a-zA-Z0-9äöüÄÖÜß\s]/g"></PromptDialog>
		<NewTrackPrompt ref="addSongPrompt" @onCommit="(song) => audioPlayer.addSong(song)"></NewTrackPrompt>
		<!--<PromptDialog ref="createPlaylist" @onCommit="(name) => createPlaylist(name)" header="Wie soll die neue Playlist heißen?" text="*Der Name muss einzigartig sein."></PromptDialog>-->
	</div>
</template>
<script>
import MediaControls from "@/components/MediaControls.vue";
import SelectList from "@/components/SelectList.vue";
import { useAudioPlayerStore } from "@/stores/audioPlayerStore.js";
import PromptDialog from "./components/PromptDialog.vue";
import ConfirmationPrompt from "./components/ConfirmationPrompt.vue";
import NewTrackPrompt from "./components/NewTrackPrompt.vue";
import { usePresetStore } from "./stores/presetStore";
import { loadNewPlaylist, loadAllPresets } from "./util/fileManager";
import { register, unregisterAll } from "@tauri-apps/api/globalShortcut";
import ErrorPrompt from "./components/ErrorPrompt.vue";
import ContextMenu from "./components/ContextMenu.vue";
import TrackSettings from "./components/TrackSettings.vue";

export default {
	setup() {
		const audioPlayer = useAudioPlayerStore();
		const preset = usePresetStore();

		return {
			audioPlayer,
			preset,
		};
	},
	data() {
		return {
			// eslint-disable-next-line vue/no-reserved-keys
			_selectedPreset: undefined,
			// eslint-disable-next-line vue/no-reserved-keys
			_selectedPlaylist: undefined,
			presets: [],
			reloadSpin: false,
			seekbar: {
				min: 0,
				max: 100,
				progress: 0,
				seek: 0,
				sliderCanMove: false,
			},
			ctxMenuOnIndex: 0,
			trackSettingsIndex: 0,
		};
	},
	methods: {
		async createPreset(presetName) {
			await this.preset.createNewPreset(presetName);
			this.presets = await loadAllPresets();
		},

		async addPlaylistToPreset() {
			if (this.preset.name.length > 0) {
				try {
					await this.preset.addPlaylist(await loadNewPlaylist());
				} catch (e) {
					console.error(e);
					this.$refs.playerError.text = e.message;
					this.$refs.playerError.open = true;
				}
			} else {
				console.error("No preset set");
			}
		},

		/**
		 * Lädt ausgewählte Playlist neu
		 */
		async reloadPlaylist() {
			if (typeof this.audioPlayer.playlist.name !== "undefined") {
				if (!this.audioPlayer.isPlaying) {
					this.reloadSpin = true;
					this.audioPlayer.setPlaylist(this._selectedPlaylist.path);
				} else {
					//TODO UI Error zeigen
					console.error("You can only reload the playlist when the player is not playing.");
				}
			}
		},

		/**
		 * Devtool: Go to next Playlist
		 */
		nextPlaylist() {
			const temp = this.preset.nextPlaylist();
			console.log(temp);
			if (typeof temp !== "undefined") {
				this.$refs.selectPlaylist.selected = temp;
				this._selectedPlaylist = temp;
			} else {
				console.error("App: Could not go to next Playlist (Return was undefined)");
			}
		},

		resetSong() {
			if (typeof this.audioPlayer.current !== "undefined") {
				if (typeof this.audioPlayer.current.player !== "undefined") {
					this.audioPlayer.current.player.load();
					this.audioPlayer.current.player.seek(0.0);
					this.audioPlayer.current.player.volume(this.audioPlayer.current.trackvolume);
					this.audioPlayer.current.player.loop(this.audioPlayer.current.isLooping);
				}
			}
		},

		async toggleHotkeys() {
			await this.$refs.mediaControls.toggleHotkeys();
			if (this.$refs.mediaControls.useHotkeys) {
				// Hotkey P for Next Playlist
				await register("P", () => {
					if (Date.now() - this.$refs.mediaControls.lastHotkey > this.$refs.mediaControls.cooldown || !this.$refs.mediaControls.hotkeyHasCooldown) {
						this.nextPlaylist();
						this.$refs.mediaControls.lastHotkey = Date.now();
					}
				});
			} else {
				await unregisterAll();
			}
		},

		getClickPosition(e) {
			e = e || window.e;

			// Breite des DOM Emlements bestimmen
			let target = e.target || e.srcElement;
			if (target.nodeType == 3) target = target.parentNode; // Fix für Safari Bug
			const wrapperWidth = this.$refs.seekbar.clientWidth; // Breite setzen

			// Mausposition bestimmen
			// this.$refs.seekInText.clientWidth korrigiert die Width, um die Breite des Elements
			// 39.5 = Anpassung, damit Handel auf Mausspitze liegt (Je höher desto weiter links)
			let seekWidth = e.clientX - this.$refs.currentSeek.clientWidth - 39.5;

			// Neuen Seek Progress berechnen --> von 0.000 bis 100.000
			this.seekbar.progress = ((seekWidth / wrapperWidth) * 100).toFixed(3);

			// Progress auf 0 oder 100 setzen, wenn Seekbar zu weit nach links oder rechts gezogen wird
			if (this.seekbar.progress > 100) this.seekbar.progress = 100;
			if (this.seekbar.progress < 0) this.seekbar.progress = 0;

			// Seek des Audio Players anpassen
			this.audioPlayer.current.player.seek((this.audioPlayer.current.player.duration() / 100) * this.seekbar.progress);
			this.seekbar.seek = this.audioPlayer.current.player.seek();
		},

		detectMouseDown(e) {
			e.preventDefault(); // Browser daran hindern, Objekte zu verschieben, Links zu folgen usw

			// Mousemovement wird getrackt
			this.$refs.mediaControlsCard.addEventListener("mousemove", this.getClickPosition, false);
		},

		detectMouseUp() {
			// Mousemovement wird nicht mehr getrackt
			this.$refs.mediaControlsCard.removeEventListener("mousemove", this.getClickPosition, false);
		},

		/**
		 * Bewegt die Seekbar anhand des Seek Wertes
		 * @param {Number} seek Seek zu dem sich die Bar bewegen soll
		 */
		updateSeekbarHandle(seek) {
			this.seekbar.seek = seek;

			if (seek > 0) {
				this.seekbar.progress = ((seek / this.audioPlayer.current.player.duration()) * 100).toFixed(3);
			} else {
				this.seekbar.progress = 0;
			}
		},

		convertTime(time) {
			const prefix = time < 0 ? "-" : "";
			time = Math.abs(time);
			let minutes = Math.floor(time / 60);
			let seconds = Math.floor(time - minutes * 60);
			if (seconds < 10) seconds = "0" + seconds;

			return prefix + minutes + ":" + seconds;
		},

		playTrack(index) {
			this.$refs.mediaControls.playTrack(index);
		},

		triggerContextMenu(i, e) {
			e.preventDefault();
			console.log("Right Click");
			// this.$refs.contextMenu.show(e)
		},

		removeTrack(index) {
			this.audioPlayer.removeTrack(index);
			if (this.trackSettingsIndex === index) {
				if (index - 1 < 0) {
					this.trackSettingsIndex = this.audioPlayer.playlist.tracks.length - 1;
				} else {
					this.trackSettingsIndex = index - 1;
				}
			}
		},
	},
	components: {
		MediaControls,
		PromptDialog,
		SelectList,
		NewTrackPrompt,
		ConfirmationPrompt,
		ErrorPrompt,
		ContextMenu,
		TrackSettings,
	},
	watch: {
		"audioPlayer.current.player"() {
			if (typeof this.audioPlayer.current?.player !== "undefined") {
				this.audioPlayer.current.player.on("loaderror", (id, e) => {
					if (e === "Failed loading audio file with status: 404.") {
						this.$refs.playerError.text = "404: Audio Datei konnte nicht im Playlisten Ordner gefunden werden.";
					} else {
						this.$refs.playerError.text = "Unbekannter Fehler beim Laden Audiodatei";
					}
					this.$refs.playerError.open = true;
				});
			}
		},
		async "_selectedPreset"(newVal) {
			if (!(await this.preset.setPreset(newVal.filename))) {
				this.presets = await loadAllPresets();
			}
		},
		async "_selectedPlaylist"(newVal) {
			this.audioPlayer.setPlaylist(newVal.path);
		},
		"audioPlayer.playlist.tracks.length"(newVal) {
			if (newVal - 1 <= this.trackSettingsIndex) {
				this.trackSettingsIndex = newVal - 1;
			}
		},
	},
	async created() {
		this.presets = await loadAllPresets();
	},
};
</script>

<style>
/* Works on Firefox */
* {
	scrollbar-width: 12px;
	scrollbar-color: #333333 #00d7ff;
}

/* Works on Chrome, Edge, and Safari */
*::-webkit-scrollbar {
	width: 12px;
}

*::-webkit-scrollbar-track {
	background: #333333;
	border-radius: 20px;
}

*::-webkit-scrollbar-thumb {
	background-color: #00d7ff;
	border-radius: 20px;
	outline-offset: -2px;
	outline: 3px solid #00d7ff;
}
</style>
