import { Howl } from "howler";
import { emit } from '@tauri-apps/api/event';

interface TrackLog {
	title: string;
	started: number;
	ended: number;
	startingSeek: string;
	playbackDuration: number;
}

interface Tracksettings {
	name: string;
	filename: string;
	volume: number;
	fadeInDuration: number;
	fadeOutDuration: number;
	isLooping: boolean;
}

export class Track {
	name: string;
	filepath: string;
	get filename(): string {
		return this.filepath.split("/").pop()!;
	}

	volume: number;
	set setVolume(volume: number) {
		this.volume = volume;
		this.player?.volume(volume);
	}
	fadeInDuration: number;
	fadeOutDuration: number;
	player?: Howl;
	isLooping: boolean;
	trackLog?: TrackLog;
	isFading = false;
	get isPlaying(): boolean {
		return this.player?.playing() ?? false;
	}
	private fadeStartTime: number = 0;
	private fadeTimeRemaining: number = 0;
	private targetVolume: number = 0;
	get isLoaded(): boolean {
		return this.player != null;
	}

	constructor(
		name: string,
		filepath: string,
		volume?: number,
		fadeInDuration?: number,
		fadeOutDuration?: number,
		isLooping?: boolean,
		preload: boolean = true
	) {
		this.name = name;
		this.filepath = filepath;
		this.volume = volume ?? 1.0;
		this.fadeInDuration = fadeInDuration ?? 0;
		this.fadeOutDuration = fadeOutDuration ?? 0;
		this.isLooping = isLooping ?? false;
		if (preload) {
			this.load();
		}
	}

	// Lädt den Howl Player, wenn dieser nicht existiert
	// Wird in den Methoden play, stop etc aufgerufen, um sicherzustellen, dass der Player geladen ist
	public load(): void {
		if (!this.isLoaded) {
			try {
				console.log(`Filepath: ${this.filepath}`);

				this.player = new Howl({
					//TODO Implement new Filestructure
					src: [this.filepath],
					volume: this.volume,
					loop: this.isLooping,
				});
			} catch (e) {
				console.error(e);
				console.log(this.filepath);
			}
		}
	}

	public unload(): void {
		this.player = null!;
		this.isFading = false;
		this.fadeStartTime = 0;
		this.fadeTimeRemaining = 0;
		this.targetVolume = 0;
	}

	// Public Method to play a track and manage fading
	public play(): void {
		if (!this.isPlaying) {
			if (this.isFading) {
				this.fade(this.player!.volume(), this.targetVolume, this.fadeTimeRemaining);
			} else {
				this._play();
			}
		}
	}

	private _play(): void {
		// TODO Implement Logging
		console.log('Here');
		this.load();
		this.player!.play();
	}

	public stop(): void {
		// TODO Implement Logging
		this.load();
		this.player!.stop();
		this.player!.seek(0);
		this.player!.volume(this.volume);
		emit("stop", this)
	}

	public pause(): void {
		// TODO Implement Logging
		this.load();
		this.player!.pause();
	}

	public fade(start_vol: number, end_vol: number, duration: number) {
		this.load();

		this.isFading = true;
		this.fadeStartTime = Date.now();
		this.fadeTimeRemaining = duration;
		this.targetVolume = end_vol;

		if (!this.isPlaying) {
			this._play();
		}

		// Beginnt den Fade über den Player
		this.player!.fade(start_vol, end_vol, duration);

		this.player!.on("fade", (duration) => {
			// Überprüft ob der Track fertig ausgefadet wurde, oder Event frühzeitig abgebrochen wurde
			if (Date.now() - this.fadeStartTime >= this.fadeTimeRemaining) {
				//Stoppt alten Track. --> Damit ist seek wieder 0.0 aber volume immer noch 0.0
				this.fadeTimeRemaining = 0;

				if (this.targetVolume == 0) {
					this.stop();
				}

				this.isFading = false;

				console.debug(`Finished fading out: ${this.name}`);

				//Emit Event to notify that the fade is finished
				emit("fadeFinished", this);
			} else {
				this.fadeTimeRemaining = duration - (Date.now() - this.fadeStartTime);
			}

			//EventListener wird entfernt
			this.player!.off("fade");
		});
	}

	public getTracksettings(): Tracksettings {
		return {
			name: this.name,
			filename: this.filename,
			volume: this.volume,
			fadeInDuration: this.fadeInDuration,
			fadeOutDuration: this.fadeOutDuration,
			isLooping: this.isLooping,
		};
	}
}
