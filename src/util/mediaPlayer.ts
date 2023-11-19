import { writeToLogfile, loadPlaylist } from "./fileManager.js";

import { Playlist } from "../modules/playlist";
import { Track } from "../modules/track";

export class MediaPlayer {
    constructor() {
    }

    playlist?: Playlist;

    activeFadingTracks: Track[] = [];

    // TODO Implement Seek
    const seek: number = 0

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
        const playlistConfig = await loadPlaylist(path);
        const tracks = playlistConfig.tracks.map((track: any) => {
            return new Track(track.name, track.filepath, track.volume, track.fadeInDuration, track.fadeOutDuration, track.isLooping, false);
        });

        this.playlist = new Playlist(playlistConfig.name, tracks);
    }

    public togglePlay(): void {
        if (typeof this.playlist !== "undefined") {
            if (this.playlist.tracks.length > 0) {
                if (typeof this.playlist.current) {
                    if (this.playlist.tracks[this.currentIndex].isPlaying) {
                        this.playlist.tracks[this.currentIndex].pause();
                    } else {
                        this.playlist.tracks[this.currentIndex].play();
                    }
                }
            }
        }

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
    }
function toggleLoop(): void {
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
}

function skipToNext(): void {
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
}

function playNext(): void {
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
}

function playPrev(): void {
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
}


async function toggleHotkeys(): any {
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
}

function playTrack(index): any {
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
}

function startLoggingTrack(track): any {
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
}
function stopLoggingTrack(track): any {
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

