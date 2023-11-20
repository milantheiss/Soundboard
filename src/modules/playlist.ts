import { Track } from "./track";
import { exists, copyFile, writeFile } from "@tauri-apps/api/fs";

export interface SongMetaData {
	name: string;
	fileOrigin: string;
	pos: number;
	filename: string;
}
export class Playlist {
	name: string;
	tracks: Track[];
	currentIndex: number = 0;
	oldIndex: number = 0;
	path: string;

	// TODO Implement Correctly
	// get path(): string {
	// 	let _path = this.playlist.path;
	// 	if (typeof _path !== "undefined") {
	// 		if (_path.startsWith("https://asset.localhost/")) {
	// 			_path = _path.slice(24);
	// 			_path = decodeURI(_path).replaceAll("%3A", ":");
	// 		}

	// 		return _path;
	// 	} else {
	// 		return undefined;
	// 	}
	// }

	get current(): Track {
		return this.tracks[this.currentIndex];
	}

	get next(): Track {
		return this.tracks[(this.currentIndex + 1) % this.tracks.length];
	}

	get previous(): Track {
		return this.tracks[(this.currentIndex - 1) % this.tracks.length];
	}

	get isPlaying(): boolean {
		return this.current.isPlaying;
	}

	constructor(name: string, path: string, tracks: Track[]) {
		this.name = name;
		this.path = path;
		this.tracks = tracks;
		this.loadBuffer();
	}

	loadBuffer(index: number = this.currentIndex): void {
		// Fix für Bug, ansonsten würde die Methode versuchen nicht existierende Player zu laden
		if (this.tracks.length > 0) {
			// Validierung. -> 0 <= index < this.tracks.length
			index = index > 0 ? index % this.tracks.length : 0;

			//Index aller Player die geladen werden sollen
			const indexOfAllPlayersToLoad = [
				index, // Current Index
				(index + 1) % this.tracks.length, // Next Index
				(index - 1 + this.tracks.length) % this.tracks.length, // Previous Index
				(index + 2) % this.tracks.length, // Buffer Forwards
				(index - 2 + this.tracks.length) % this.tracks.length, // Buffer Backwards
			];

			//Entfernt doppelte Einträge --> Wenn die Playlist weniger als 5 Tracks hat.
			const uniqueIndex = [...new Set(indexOfAllPlayersToLoad)];

			//Lädt alle Player die noch nicht geladen sind
			uniqueIndex.forEach((i) => {
				this.tracks[i].load();
			});
		}
	}

    // Entlädt den Player Buffer. Player wird nicht unloaded, wenn er spieled
    unloadBuffer(index: number = this.currentIndex): void {
        if (this.tracks.length > 0) {
            index = index > 0 ? index % this.tracks.length : 0;

            //Index aller Player die geladen werden sollen
			const indexOfAllPlayersToLoad = [
				index, // Current Index
				(index + 1) % this.tracks.length, // Next Index
				(index - 1 + this.tracks.length) % this.tracks.length, // Previous Index
				(index + 2) % this.tracks.length, // Buffer Forwards
				(index - 2 + this.tracks.length) % this.tracks.length, // Buffer Backwards
			];

			//Entfernt doppelte Einträge --> Wenn die Playlist weniger als 5 Tracks hat.
			const uniqueIndex = [...new Set(indexOfAllPlayersToLoad)];

			//Lädt alle Player die noch nicht geladen sind
			uniqueIndex.forEach((i) => {
                if (!this.tracks[i].isPlaying){
                    this.tracks[i].unload();
                }
			});
        }
    }

	public goToNext(): void {
		this.oldIndex = this.currentIndex;
		this.currentIndex = (this.currentIndex + 1) % this.tracks.length;

		const getIndexForwardsBuffer = () => {
			return (this.currentIndex + 2) % this.tracks.length;
		};

		const getIndexOldBackwardsBuffer = () => {
			return (this.currentIndex - 3 + this.tracks.length) % this.tracks.length;
		};

		if (this.tracks.length > 5) {
			this.tracks[getIndexForwardsBuffer()].load();
			this.tracks[getIndexOldBackwardsBuffer()].unload();
		}
	}

	public goToPrevious(): void {
		this.oldIndex = this.currentIndex;
		this.currentIndex = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;

		const getIndexBackwardsBuffer = () => {
			return (this.currentIndex - 2 + this.tracks.length) % this.tracks.length;
		};

		const getIndexOldForwardsBuffer = () => {
			return (this.currentIndex + 3) % this.tracks.length;
		};

		if (this.tracks.length > 5) {
			this.tracks[getIndexBackwardsBuffer()].load();
			this.tracks[getIndexOldForwardsBuffer()].unload();
		}
	}

	public async addSong(track: SongMetaData, position: number): Promise<void> {
		// TODO Add name check for duplicates

		// Kopiert die Sounddatei in den Playlist Ordner, wenn noch nicht enthalten
		if (!(await exists([this.path, track.fileOrigin].join("\\")))) {
			await copyFile(track.fileOrigin, [this.path, track.filename].join("\\"));
		}

		// Erstellt neues Track Objekt, das den Song repräsentiert
		const newTrack = new Track(track.name, [this.path, track.filename].join("\\"));

		// Updatet die Playlist
		this.tracks.splice(position, 0, newTrack);
		// Lade Buffer für current index
		this.loadBuffer();

		// Speichert neue Playlist Config
		this.updateConfigFile();
	}

	// Entfernt einen Song aus der Playlist und lädt den Buffer neu
	// INFO Sounddatei wird nicht aus dem Playlist Ordner entfernt
	public async removeSong(position: number): Promise<void> {
		this.tracks.splice(position, 1);
		this.loadBuffer();
		this.updateConfigFile();
	}

	// Kann ausgeführt werden, um die Playlist Config zu aktualisieren
	private async updateConfigFile(): Promise<void> {
		const playlist_config = {
			name: this.name,
			tracks: this.tracks.map((track) => track.getTracksettings()),
		};

		await writeFile({ path: [this.path, ".soundboard", "playlist.config.json"].join("\\"), contents: JSON.stringify(playlist_config) });
		console.debug("Written to config");
	}

	/**
	 * Lässt den Player zu einem beliebigen Index springen und lädt den Buffer neu
	 * @param {Number} index
	 */
	jumpToIndex(index: number): void {
		//Speichert alten Index
		this.oldIndex = this.currentIndex;

        // Warning Bug wenn man einen Player Unloadet der gerade spielt wird dieser nicht unloaded, sodass zwei Player spielen
        //Entlädt Buffer um alten Index
		this.unloadBuffer(this.currentIndex)

		//Erhöht Index
		this.currentIndex = index;
	}
}
