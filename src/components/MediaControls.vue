<template>
	<div class="grid grid-cols-3 gap-3 items-center w-full">
		<button
			@click="playPrev"
			class="h-fit px-2 py-2 border border-transparent bg-electric-blue rounded-xl shadow-lg text-base font-medium text-black hover:bg-electric-blue-hover focus:outline-none focus:ring-2 focus:ring-electric-blue-hover focus:ring-offset-2 flex justify-center items-center">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
				<path
					d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
			</svg>
		</button>

		<span
			class="h-full px-2 py-2 border border-transparent bg-electric-blue rounded-xl shadow-lg text-base font-medium text-black hover:bg-electric-blue-hover focus:outline-none focus:ring-2 focus:ring-electric-blue-hover focus:ring-offset-2 hover:cursor-pointer flex justify-center items-center"
			@click="togglePlay">
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
			@click="playNext"
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

<script>
import { useAudioPlayerStore } from "@/stores/audioPlayerStore.js";
import SeekUpdater from "./SeekUpdater.vue";
import { register, unregisterAll } from "@tauri-apps/api/globalShortcut";
import { writeToLogfile } from "../util/fileManager.js";

export default {
	name: "MediaControls",
	setup() {
		const audioPlayer = useAudioPlayerStore();

		return {
			audioPlayer,
		};
	},
	data() {
		return {
			fade: {
				_from: {
					data: undefined,
					player: undefined,
					isFading: false,
					fadeStartTime: undefined,
					fadeDurationPlayed: 0,
				},
				_to: {
					data: undefined,
					player: undefined,
					isFading: false,
					fadeStartTime: undefined,
					fadeDurationPlayed: 0,
				},
				isCrossfading: false,
				crossfade: this._startCrossfade,
				resume: this._resumeFade,
				pause: this._pauseFade,
				stop: this._stopFade,
			},
			seek: 0,
			//IMPORTANT Nicht final
			useHotkeys: false,
			hotkeyHasCooldown: true,
			lastHotkey: 0,
			cooldown: 750, //TODO 750
		};
	},
	expose: ["toggleHotkeys", "useHotkeys", "cooldown", "hotkeyHasCooldown", "lastHotkey", "seek", "playTrack"],
	emits: ["seekValue"],
	components: {
		SeekUpdater,
	},
	methods: {
		togglePlay() {
			if (typeof this.audioPlayer.current !== "undefined") {
				//Pausiert wenn Sound abgespielt wird.
				if (this.audioPlayer.isPlaying) {
					console.debug("Player was paused.");

					//Nur bei Crossfade wichtig: Pausieren auch Next & Previous, wenn in Fading Process wurde
					if (this.isFading) {
						console.debug("Pause fade from togglePlay()");
						this.fade.pause();
					} else {
						this.stopLoggingTrack(this.audioPlayer.current);
						this.audioPlayer.current.player.pause();
					}
				} else {
					//Startet wenn noch kein Sound gespielt wird.
					console.debug(`Now playing: ${this.audioPlayer.current.name}`);

					//Nur bei Crossfade wichtig: Startet auch Next & Previous, wenn in Fading Process pausiert wurde
					if (this.isFading) {
						console.debug("Fade triggered from togglePlay()");
						this.fade.resume();
					} else {
						this.audioPlayer.current.player.on("end", () => {
							this.skipToNext();
						});

						this.startLoggingTrack(this.audioPlayer.current);
						this.audioPlayer.current.player.play();
					}
				}
			} else {
				console.error("No current track loaded");
			}
		},
		toggleLoop() {
			if (typeof this.audioPlayer.current !== "undefined") {
				this.audioPlayer.current.isLooping = !this.audioPlayer.current.isLooping;
				console.debug("Player is looping", this.audioPlayer.isLooping);
				//Error catch, falls noch kein Player existiert
				if (!(typeof this.audioPlayer.current.player === "undefined")) {
					this.audioPlayer.current.player.loop(this.audioPlayer.isLooping);
				}
			} else {
				console.error("No current track loaded");
			}
		},
		skipToNext() {
			if (!this.audioPlayer.current.isLooping) {
				//Muss Next blockieren, da loading von Howl Player lange braucht. Es entsteht ansonsten ein Bug, wenn man Next bei undefined Player spamt
				if (typeof this.audioPlayer.current !== "undefined") {
					this._fadeIn(this.audioPlayer.next);
					this.audioPlayer.next.player.on("end", () => {
						this.skipToNext();
					});

					this.stopLoggingTrack(this.audioPlayer.current);
					this.audioPlayer.current.player.stop();
					this.audioPlayer.current.player.seek(0);
					this.audioPlayer.current.player.volume(this.audioPlayer.current.trackvolume);

					this.audioPlayer.current.player.off("end");

					//Der Index wird verschoben
					this.audioPlayer.advanceToNextIndex();
				} else {
					console.error("No current track loaded");
				}
			}
		},
		playNext() {
			//Muss Next blockieren, da loading von Howl Player lange braucht. Es entsteht ansonsten ein Bug, wenn man Next bei undefined Player spamt
			if (typeof this.audioPlayer.current !== "undefined") {
				//Wenn schon ein Song gespielt wird, dann starte Crossfade
				if (this.audioPlayer.isPlaying) {
					if (this.audioPlayer.playlist.tracks.length > 1) {
						this.audioPlayer.current.player.off("end");
						this.audioPlayer.next.player.on("end", () => {
							this.skipToNext();
						});
						this.fade.crossfade(this.audioPlayer.current, this.audioPlayer.next);
					} else {
						//Notlösung für wenn nur ein Track in Playlist ist
						this.fade.stop();
						this.stopLoggingTrack(this.audioPlayer.current);
						this.audioPlayer.current.player.stop();
						if (typeof this.audioPlayer.next.player !== "undefined") {
							this.audioPlayer.next.player.volume(this.audioPlayer.next.trackvolume);
							this.startLoggingTrack(this.audioPlayer.next);
							this.audioPlayer.next.player.play();
						}
					}
				} else {
					//Wenn Song nicht spielt, wird der Fade sicherheitshalber gecleart und das Volume angepasst.
					this.fade.stop();
					if (typeof this.audioPlayer.next.player !== "undefined") {
						this.audioPlayer.next.player.volume(this.audioPlayer.next.trackvolume);
					}
					if (typeof this.audioPlayer.current.player !== "undefined") {
						this.audioPlayer.current.player.stop();
					}
					this.seek = 0;
				}
				//Der Index wird verschoben
				this.audioPlayer.advanceToNextIndex();
			} else {
				console.error("No current track loaded");
			}
		},
		playPrev() {
			//Muss Prev blockieren, da loading von Howl Player lange braucht. Es entsteht ansonsten ein Bug, wenn man Prev bei undefined Player spamt
			if (typeof this.audioPlayer.current !== "undefined") {
				//Wenn schon ein Song gespielt wird, dann starte Crossfade
				if (this.audioPlayer.isPlaying) {
					if (this.audioPlayer.playlist.tracks.length > 1) {
						this.audioPlayer.current.player.off("end");
						this.audioPlayer.previous.player.on("end", () => {
							this.skipToNext();
						});
						this.fade.crossfade(this.audioPlayer.current, this.audioPlayer.previous);
					} else {
						//Notlösung für wenn nur ein Track in Playlist ist
						this.fade.stop();
						this.audioPlayer.current.player.stop();
						if (typeof this.audioPlayer.previous.player !== "undefined") {
							this.audioPlayer.previous.player.volume(this.audioPlayer.previous.trackvolume);
							this.startLoggingTrack(this.audioPlayer.previous);
							this.audioPlayer.previous.player.play();
						}
					}
				} else {
					//Wenn Song nicht spielt, wird der Fade sicherheitshalber gecleart und das Volume angepasst.
					this.fade.stop();
					if (typeof this.audioPlayer.previous.player !== "undefined") {
						this.audioPlayer.previous.player.volume(this.audioPlayer.previous.trackvolume);
					}
					if (typeof this.audioPlayer.current.player !== "undefined") {
						this.audioPlayer.current.player.stop();
					}
					this.seek = 0;
				}
				//Der Index wird verschoben
				this.audioPlayer.advanceToPreviousIndex();
			} else {
				console.error("No current track loaded");
			}
		},
		_startCrossfade(from, to) {
			//INFO Fade Duration in ms

			//Stoppt Fade, wenn neuer Fade angefangen wird.
			if (this.isFading) {
				this.fade.stop();
			}

			//Setup _from und _to (neu)
			this.fade.isCrossfading = true;

			console.debug(`Fading from ${from.name} to ${to.name}`);

			this._fadeOut(from);
			this._fadeIn(to);

			from.player.on("fade", () => {
				//Wenn Track fertig ausgefadet wurde. Wird bei Abbruch des Fades nicht ausgeführt.
				if (this.fade._from.player.playing() || this.fade._from.player.seek() >= this.fade._from.player.duration()) {
					//Erhöhe Index auf nächsten Track, wenn current schneller ausgefadet ist.
					if (this.fade._from.data.fadeOutDuration >= this.fade._to.data.fadeInDuration) {
						this.fade.isCrossfading = false;
					}
					//EventListener wird entfernt
					this.fade._from.player.off("fade");
				}
			});

			to.player.on("fade", () => {
				//Wenn Track fertig ausgefadet wurde. Wird bei Abbruch des Fades nicht ausgeführt.
				if (this.fade._to.player.playing() || this.fade._to.player.seek() >= this.fade._to.player.duration()) {
					//Erhöhe Index auf nächsten Track, wenn next schneller ausfadet.
					if (this.fade._to.data.fadeInDuration >= this.fade._from.data.fadeOutDuration) {
						this.fade.isCrossfading = false;
					}

					//EventListener wird entfernt
					this.fade._to.player.off("fade");
				}
			});
		},
		_fadeOut(from) {
			this.fade._from.data = from;
			this.fade._from.player = from.player;
			this.fade._from.isFading = true;

			//Faded spielenden Track aus, für die FadeOutDuration des Tracks
			from.player.fade(from.player.volume(), 0.0, from.fadeOutDuration);
			this.fade._from.fadeStartTime = Date.now();

			from.player.on("fade", () => {
				//Wenn Track fertig ausgefadet wurde. Wird bei Abbruch des Fades nicht ausgeführt.
				if (this.fade._from.player.playing() || this.fade._from.player.seek() >= this.fade._from.player.duration()) {
					//Stoppt alten Track. --> Damit ist seek wieder 0.0 aber volume immer noch 0.0
					this.stopLoggingTrack(this.fade._from.data);
					this.fade._from.player.stop();
					this.fade._from.player.seek(0);
					this.fade._from.player.volume(this.fade._from.data.trackvolume);
					this.fade._from.fadeStartTime = undefined;
					this.fade._from.fadeDurationPlayed = 0;

					console.debug(`Finished fading from ${this.fade._from.data.name}`);

					this.fade._from.isFading = false;

					//EventListener wird entfernt
					this.fade._from.player.off("fade");
				} else {
					//Wenn Track nicht fertig ausgefadet wurde. Wird bei Abbruch des Fades ausgeführt.
					console.debug(`Fading from current ${this.fade._from.data.name} not finished!`);
				}
			});
		},
		_fadeIn(to) {
			this.fade._to.data = to;
			this.fade._to.player = to.player;
			this.fade._to.isFading = true;

			if (!to.player.playing()) {
				to.player.play();
				this.startLoggingTrack(to);
			}

			to.player.volume(0.0);

			//Beginnt den nächsten Track einzufaden
			to.player.fade(0.0, to.trackvolume, to.fadeInDuration);
			this.fade._to.fadeStartTime = Date.now();

			to.player.on("fade", () => {
				//Wenn Track fertig ausgefadet wurde. Wird bei Abbruch des Fades nicht ausgeführt.
				if (this.fade._to.player.playing() || this.fade._to.player.seek() >= this.fade._to.player.duration()) {
					console.debug(`Finished fading to ${this.fade._to.data.name}`);

					this.fade._to.isFading = false;
					this.fade._to.player.volume(this.fade._to.data.trackvolume);
					this.fade._to.fadeStartTime = undefined;
					this.fade._to.fadeDurationPlayed = 0;
					//EventListener wird entfernt
					this.fade._to.player.off("fade");
				} else {
					//Wenn Track nicht fertig ausgefadet wurde. Wird bei Abbruch des Fades ausgeführt.
					console.debug(`Fading to next ${this.fade._to.data.name} not finished!`);
				}
			});
		},
		_pauseFade() {
			if (this.fade._from.isFading) {
				this.fade._from.fadeDurationPlayed += Date.now() - this.fade._from.fadeStartTime;
				this.fade._from.player.pause();

				this.stopLoggingTrack(this.fade._from.data);
			}

			if (this.fade._to.isFading) {
				this.fade._to.fadeDurationPlayed += Date.now() - this.fade._to.fadeStartTime;
			}

			if (this.fade._to.player.playing()) {
				this.fade._to.player.pause();
				this.stopLoggingTrack(this.fade._to.data);
			}
		},
		_resumeFade() {
			//TODO Resume für weitere Fadearten erweitern
			// if (this.fade.isCrossfading) {
			if (this.fade._from.isFading) {
				if (!this.fade._from.player.playing()) {
					this.startLoggingTrack(this.fade._from.data);
					this.fade._from.player.play();
				}

				this.fade._from.player.fade(this.fade._from.player.volume(), 0.0, this.fade._from.data.fadeOutDuration - this.fade._from.fadeDurationPlayed);
				this.fade._from.fadeStartTime = Date.now();
			}

			if (!this.fade._to.player.playing()) {
				this.startLoggingTrack(this.fade._to.data);
				this.fade._to.player.play();
			}
			if (this.fade._to.isFading) {
				this.fade._to.player.fade(
					this.fade._to.player.volume(),
					this.fade._to.data.trackvolume,
					this.fade._to.data.fadeInDuration - this.fade._to.fadeDurationPlayed
				);
				this.fade._to.fadeStartTime = Date.now();
			}
			// }
		},
		_stopFade() {
			if (typeof this.fade._from.player !== "undefined") {
				this.fade._from.player.off("fade");

				//Faded letzten Song schnell aus --> Um Knacken zu verhindern
				if (this.fade._from.isFading && this.fade._from.player.volume() > 0.0 && this.fade._from.player.playing()) {
					this.fade._from.player.fade(this.fade._from.player.volume(), 0.0, 250);
				}

				this.stopLoggingTrack(this.fade._from.data);
				this.fade._from.player.stop();
			}

			if (typeof this.fade._to.player !== "undefined") {
				this.fade._to.player.off("fade");
			}

			this.fade._from.isFading = false;
			this.fade._from.data = undefined;
			this.fade._from.player = undefined;
			this.fade._from.fadeStartTime = undefined;
			this.fade._from.fadeDurationPlayed = 0;

			this.fade._to.isFading = false;
			this.fade._to.data = undefined;
			this.fade._to.player = undefined;
			this.fade._to.fadeStartTime = undefined;
			this.fade._to.fadeDurationPlayed = 0;
		},
		async toggleHotkeys() {
			this.useHotkeys = !this.useHotkeys;
			if (this.useHotkeys) {
				//Hotkey Space for Start/Pause
				await register("Space", () => {
					if (Date.now() - this.lastHotkey > this.cooldown || !this.hotkeyHasCooldown) {
						this.togglePlay();
						this.lastHotkey = Date.now();
					}
				});
				//Hotkey V for Previous
				await register("V", () => {
					if (Date.now() - this.lastHotkey > this.cooldown || !this.hotkeyHasCooldown) {
						this.playPrev();
						this.lastHotkey = Date.now();
					}
				});
				//Hotkey N for Next
				await register("N", () => {
					if (Date.now() - this.lastHotkey > this.cooldown || !this.hotkeyHasCooldown) {
						this.playNext();
						this.lastHotkey = Date.now();
					}
				});
			} else {
				await unregisterAll();
			}
		},
		playTrack(index) {
			if (this.audioPlayer.current.player.playing()) {
				this.audioPlayer.loadPlayer(index);
				this.fade.crossfade(this.audioPlayer.current, this.audioPlayer.playlist.tracks[index]);
			} else {
				this.fade.stop();
				if (this.audioPlayer.current.player.playing()) {
					this.stopLoggingTrack(this.audioPlayer.current);
				}
				this.audioPlayer.current.player.stop();
				this.audioPlayer.current.player.volume(this.audioPlayer.current.trackvolume);
				this.seek = 0;
			}
			this.audioPlayer.jumpToIndex(index);
			this.audioPlayer.current.player.volume();
		},
		startLoggingTrack(track) {
			/*
			trackLog: {
				title: String, //Song Title
				started: Number, //In Unix Timestamp
				ended: Number, //In Unix Timestamp
				startingSeek: Number, //In Sekunden
				playbackDuration: Number, //In Millisekunden
			}
			*/
			const _seek = Math.round(track.player.seek() * 100);
			const min = ("0" + Math.floor(_seek / 6000)).slice(-2); // Minuten des Seeks im Format mm
			const sec = ("0" + Math.floor((_seek % 6000) / 100)).slice(-2); // Sekunden des Seeks im Format ss

			track.trackLog = {
				started: Date.now(),
				title: track.name,
				startingSeek: `${min}:${sec} Min`, //Rundet auf 2 Nachkommastellen & Gibt den Seek als lesbaren String in Min aus
			};
		},
		stopLoggingTrack(track) {
			// if (track.trackLog === undefined) return;

			try {
				track.trackLog.ended = Date.now();
				track.trackLog.playbackDuration = (Date.now() - track.trackLog.started) / 1000;

				track.trackLog.started = new Date(track.trackLog.started).toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
				track.trackLog.ended = new Date(track.trackLog.ended).toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

				writeToLogfile(track.trackLog);
			} catch (e) {
				console.error(e);
				console.log(track);
			}
		},
	},
	computed: {
		isFading() {
			//Kann Error werfen, wenn _to oder _from 'undefined' ist.
			try {
				if (this.fade._to?.isFading || this.fade._from?.isFading) {
					return true;
				} else {
					return false;
				}
			} catch {
				return false;
			}
		},
	},
	watch: {
		"audioPlayer.playlist"(newVal, oldVal) {
			try {
				if (oldVal.tracks[this.audioPlayer.oldIndex].player.playing()) {
					this.audioPlayer.current.player.on("end", () => {
						this.skipToNext();
					});
					this.fade.crossfade(oldVal.tracks[this.audioPlayer.oldIndex], this.audioPlayer.current);
				}
			} catch {
				console.debug("Could not fade into new playlist");
			}
		},
		"seek"() {
			this.$emit("seekValue", this.seek);
		},
	},
};
</script>
