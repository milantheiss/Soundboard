import { Track } from './track';

export class Playlist {
    name: string;
    tracks: Track[];
    currentIndex: number = 0;
    oldIndex: number = 0;

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

    // TODO Implement Correctly
    get path(): string {
        let _path = this.playlist.path;
        if (typeof _path !== "undefined") {
            if (_path.startsWith("https://asset.localhost/")) {
                _path = _path.slice(24);
                _path = decodeURI(_path).replaceAll("%3A", ":");
            }

            return _path;
        } else {
            return undefined;
        }
    }

    constructor(name: string, tracks: Track[]) {
        this.name = name;
        this.tracks = tracks;
        this.loadBuffer()
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
}