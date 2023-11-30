import { loadPlaylist } from "./fileManager.js";

import { Playlist } from "../modules/playlist";
import { Track } from "../modules/track";
import { listen } from "@tauri-apps/api/event";

export class MediaPlayer {
	constructor() { }

	playlist?: Playlist;

	trackBuffer = new Set<Track>();
	get isPlaying(): boolean {
		return this.playlist?.current.isPlaying ?? false;
	}

	// TODO Implement Seek
	seek: number = 0;

	//TODO Reimplement
	// const useHotkeys: boolean = false
	// const hotkeyHasCooldown: boolean = true
	// const lastHotkey: number = 0
	// const cooldown: number = 750

	// TODO loadPlaylist

	/**
	 * Lädt ein Playlist
	 * @param {String} path Absoluter Path zur Playlist Ordner
	 */
	async setPlaylist(path: string) {
		console.log("Load Playlist");

		const playlistConfig = await loadPlaylist(path);

		console.log("Playlist Config", playlistConfig);

		const getFilepath = (playlistPath: string, filename: string) => {
			filename = filename.replaceAll(" ", "%20");

			return [playlistPath, filename].join("%5C");
		}

		const tracks = playlistConfig.tracks.map((track: { name: string; filename: string; volume: number | undefined; fadeInDuration: number | undefined; fadeOutDuration: number | undefined; isLooping: boolean | undefined; }) => new Track(track.name, getFilepath(path, track.filename), track.volume, track.fadeInDuration, track.fadeOutDuration, track.isLooping, false));

		this.playlist = new Playlist(playlistConfig.name, path, tracks);
	}

	public async togglePlay(): Promise<void> {
		//TODO Implement Fading Tracks...
		console.log("Toggle Play", this.playlist?.current.name);

		await listen("start", (e) => {
			console.log(e.payload);
		});


		if (this.playlist && this.playlist.tracks.length > 0) {
			if (this.playlist.current.isPlaying) {
				this.playlist.current.pause();
			} else {
				this.playlist.current.play();
				// this.playlist.current.on("stop", () => {
				// 	this.trackBuffer.delete(this.playlist!.current);
				// }
				// );
				this.trackBuffer.add(this.playlist.current);
			}
		}
	}

	public skipToNext(): void {
		console.log("Skip to Next");

		if (this.playlist && this.playlist.tracks.length > 0) {
			this.playlist.current.stop();
			this.playlist.goToNext();
			this.playlist.current.play();
		}
	}
}

// "audioPlayer.playlist"(newVal, oldVal) {
//     try {
//         if (oldVal.tracks[this.audioPlayer.oldIndex].player.playing()) {
//             this.audioPlayer.current.player.on("end", () => {
//                 this.skipToNext();
//             });
//             this.fade.crossfade(oldVal.tracks[this.audioPlayer.oldIndex], this.audioPlayer.current);
//         }
//     } catch {
//         console.debug("Could not fade into new playlist");
//     }
// },
// "seek"() {
//     this.$emit("seekValue", this.seek);
// },
