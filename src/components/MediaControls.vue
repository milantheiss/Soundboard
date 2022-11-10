<template>
    <div class="flex items-center justify-center">
        <button @click="playPrev" class="
        w-fit
        mr-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2" :class="blockTrackChange === true ? 'outline outline-red-600 outline-2 outline-offset-2' : ''">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                <path
                    d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
            </svg>
        </button>

        <button @click="togglePlay" class="
        w-fit
        mx-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2" v-if="!audioPlayer.isPlaying">
            <!--Play Icon-->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                <path fill-rule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clip-rule="evenodd" />
            </svg>
        </button>
        <button @click="togglePlay" class="
        w-fit 
        mx-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2" v-if="audioPlayer.isPlaying">
            <!--Pause Icon-->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                <path fill-rule="evenodd"
                    d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                    clip-rule="evenodd" />
            </svg>
        </button>

        <button @click="playNext" class="w-fit 
        ml-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2 " :class="blockTrackChange === true ? 'outline outline-red-600 outline-2 outline-offset-2' : ''">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                <path
                    d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
            </svg>
        </button>
    </div>
    <SeekUpdater v-model="seek"></SeekUpdater>
</template>

<script>
import { Howl } from "howler"
import { useAudioPlayerStore } from '@/stores/audioPlayerStore.js'
import SeekUpdater from "./SeekUpdater.vue"

export default {
    name: "MediaControls",
    setup() {
        const audioPlayer = useAudioPlayerStore()

        return {
            audioPlayer
        }
    },
    data() {
        return {
            fade: {
                _from: {
                    data: undefined,
                    player: undefined,
                    isFading: false
                },
                _to: {
                    data: undefined,
                    player: undefined,
                    isFading: false
                },
                isFading: this._isFading,
                isCrossfading: false,
                crossfade: this._startCrossfade,
                resume: this._resumeFade,
                pause: this._pauseFade,
                stop: this._stopFade
            },
            blockTrackChange: false,
            seek: undefined
        }
    },
    expose: ['blockTrackChange'],
    components: {
        SeekUpdater
    },
    methods: {
        togglePlay() {
            if (typeof this.audioPlayer.current !== 'undefined') {
                //Wenn für zu spielenden Song kein Player existiert, wird neuer erstellt.
                if (typeof this.audioPlayer.current.player === 'undefined') {
                    //INFO Path ist die API URL aus Tauri
                    //Siehe https://tauri.app/v1/api/js/tauri#convertfilesrc
                    this.blockTrackChange = true
                    this.audioPlayer.current.player = new Howl({ src: [[this.audioPlayer.playlist.path, this.audioPlayer.current.filename].join('%5C')], volume: this.audioPlayer.current.trackvolume, loop: this.audioPlayer.current.isLooping })
                    this.audioPlayer.current.player.on('play', () => {
                        console.log("Block aus in Toggle play");
                        this.blockTrackChange = false
                        this.audioPlayer.current.player.off('play')
                    })
                    console.log("Set in TogglePlay");
                    this.audioPlayer.current.player.on('end', () => {
                        this.skipToNext()
                    })
                }

                //Pausiert wenn Sound abgespielt wird. 
                if (this.audioPlayer.isPlaying) {
                    console.debug("Player was paused.")

                    //Nur bei Crossfade wichtig: Pausieren auch Next & Previous, wenn in Fading Process wurde
                    if (this.fade.isFading()) {
                        this.fade.pause()
                    } else {
                        this.audioPlayer.current.player.pause()
                    }
                } else { //Startet wenn noch kein Sound gespielt wird.
                    console.debug(`Now playing: ${this.audioPlayer.current.name}`)

                    //Nur bei Crossfade wichtig: Startet auch Next & Previous, wenn in Fading Process pausiert wurde
                    if (this.fade.isFading()) {
                        console.debug("Fade triggered from togglePlay()")
                        this.fade.resume()
                    } else {
                        this.audioPlayer.current.player.play();
                    }
                }
            } else {
                console.error("No current track loaded");
            }
        },
        toggleLoop() {
            if (typeof this.audioPlayer.current !== 'undefined') {
                this.audioPlayer.current.isLooping = !this.audioPlayer.current.isLooping
                console.debug("Player is looping", this.audioPlayer.isLooping)
                //Error catch, falls noch kein Player existiert
                if (!(typeof this.audioPlayer.current.player === 'undefined')) {
                    this.audioPlayer.current.player.loop(this.audioPlayer.isLooping)
                }
            } else {
                console.error("No current track loaded");
            }
        },
        skipToNext() {
            if (!this.audioPlayer.current.isLooping) {
                //Muss Next blockieren, da loading von Howl Player lange braucht. Es entsteht ansonsten ein Bug, wenn man Next bei undefined Player spamt
                if (!this.blockTrackChange) {
                    if (typeof this.audioPlayer.current !== 'undefined') {
                        //Wenn schon ein Song gespielt wird, dann starte Crossfade
                        if (typeof this.audioPlayer.next.player === 'undefined') {
                            console.log("Block set in SkipToNext");
                            this.blockTrackChange = true
                            this.audioPlayer.next.player = new Howl({ src: [[this.audioPlayer.playlist.path, this.audioPlayer.next.filename].join('%5C')], volume: 0.0, loop: this.audioPlayer.next.isLooping })
                            this.audioPlayer.next.player.on('play', () => {
                                console.log('Block aus in SkipToNext')
                                this.blockTrackChange = false
                                this.audioPlayer.next.player.off('play')
                            })
                            this.audioPlayer.next.player.on('end', () => {
                                this.skipToNext()
                            })
                        }
                        this.fade.crossfade(this.audioPlayer.current, this.audioPlayer.next)
                        //Der Index wird verschoben
                        this.audioPlayer.advanceToNextIndex()
                    } else {
                        console.error("No current track loaded");
                    }
                } else {
                    console.error("Next is blocked")
                }
            }
        },
        playNext() {
            //Muss Next blockieren, da loading von Howl Player lange braucht. Es entsteht ansonsten ein Bug, wenn man Next bei undefined Player spamt
            if (!this.blockTrackChange) {
                if (typeof this.audioPlayer.current !== 'undefined') {
                    //Wenn schon ein Song gespielt wird, dann starte Crossfade
                    if (this.audioPlayer.isPlaying) {
                        if (this.audioPlayer.playlist.tracks.length > 1) {
                            if (typeof this.audioPlayer.next.player === 'undefined') {
                                console.log(this.audioPlayer.next.name,  "Block set in PlayNext");
                                this.blockTrackChange = true
                                this.audioPlayer.next.player = new Howl({ src: [[this.audioPlayer.playlist.path, this.audioPlayer.next.filename].join('%5C')], volume: 0.0, loop: this.audioPlayer.next.isLooping })
                                this.audioPlayer.next.player.on('play', () => {
                                    this.blockTrackChange = false
                                    console.log("Block aus in PlayNext");
                                    this.audioPlayer.next.player.off('play')
                                })
                                this.audioPlayer.next.player.on('end', () => {
                                    this.skipToNext()
                                })
                            }
                            this.fade.crossfade(this.audioPlayer.current, this.audioPlayer.next)
                        } else { //Notlösung für wenn nur ein Track in Playlist ist
                            console.log("Stop Fade");
                            this.fade.stop()
                            this.audioPlayer.current.player.stop()
                            if (typeof this.audioPlayer.next.player !== 'undefined') {
                                this.audioPlayer.next.player.volume(this.audioPlayer.next.trackvolume)
                                this.audioPlayer.next.player.play()
                            }
                        }
                    } else { //Wenn Song nicht spielt, wird der Fade sicherheitshalber gecleart und das Volume angepasst.
                        this.fade.stop()
                        if (typeof this.audioPlayer.next.player !== 'undefined') {
                            this.audioPlayer.next.player.volume(this.audioPlayer.next.trackvolume)
                        }
                        if (typeof this.audioPlayer.current.player !== 'undefined') {
                            this.audioPlayer.current.player.stop()
                        }
                    }
                    //Der Index wird verschoben
                    this.audioPlayer.advanceToNextIndex()
                } else {
                    console.error("No current track loaded");
                }
            } else {
                console.error("Next is blocked")
            }
        },
        playPrev() {
            //Muss Prev blockieren, da loading von Howl Player lange braucht. Es entsteht ansonsten ein Bug, wenn man Prev bei undefined Player spamt
            if (!this.blockTrackChange) {
                if (typeof this.audioPlayer.current !== 'undefined') {
                    //Wenn schon ein Song gespielt wird, dann starte Crossfade
                    if (this.audioPlayer.isPlaying) {

                        if (this.audioPlayer.playlist.tracks.length > 1) {
                            if (typeof this.audioPlayer.previous.player === 'undefined') {
                                console.log("Block set in PlayPrev");
                                this.blockTrackChange = true
                                this.audioPlayer.previous.player = new Howl({ src: [[this.audioPlayer.playlist.path, this.audioPlayer.previous.filename].join('%5C')], volume: 0.0, loop: this.audioPlayer.previous.isLooping })
                                this.audioPlayer.previous.player.on('play', () => {
                                    this.blockTrackChange = false
                                    console.log("Block aus in PlayPrev");
                                    this.audioPlayer.previous.player.off('play')
                                })
                                this.audioPlayer.previous.player.on('end', () => {
                                    this.skipToNext()
                                })
                            }
                            this.fade.crossfade(this.audioPlayer.current, this.audioPlayer.previous)
                        } else { //Notlösung für wenn nur ein Track in Playlist ist
                            this.fade.stop()
                            this.audioPlayer.current.player.stop()
                            if (typeof this.audioPlayer.previous.player !== 'undefined') {
                                this.audioPlayer.previous.player.volume(this.audioPlayer.previous.trackvolume)
                                this.audioPlayer.previous.player.play()
                            }
                        }
                    } else { //Wenn Song nicht spielt, wird der Fade sicherheitshalber gecleart und das Volume angepasst.
                        this.fade.stop()
                        if (typeof this.audioPlayer.previous.player !== 'undefined') {
                            this.audioPlayer.previous.player.volume(this.audioPlayer.previous.trackvolume)
                        }
                        if (typeof this.audioPlayer.current.player !== 'undefined') {
                            this.audioPlayer.current.player.stop()
                        }
                    }
                    //Der Index wird verschoben
                    this.audioPlayer.advanceToPreviousIndex()
                } else {
                    console.error("No current track loaded");
                }
            } else {
                console.error("Previous is blocked")
            }
        },
        _startCrossfade(from, to) {
            //INFO Fade Duration in ms

            //Stoppt Fade, wenn neuer Fade angefangen wird.
            if (this.fade.isFading()) {
                this.fade.stop()
            }

            //Setup _from und _to (neu)
            this.fade._from.data = from
            this.fade._from.player = from.player

            this.fade._to.data = to

            this.fade._from.isFading = true
            this.fade._to.isFading = true

            this.fade.isCrossfading = true


            console.debug(`Fading from ${from.name} to ${to.name}`)

            //Faded spielenden Track aus, für die FadeOutDuration des Tracks
            from.player.fade(from.player.volume(), 0.0, from.fadeOutDuration)

            from.player.on('fade', () => {
                //Wenn Track fertig ausgefadet wurde. Wird bei Abbruch des Fades nicht ausgeführt.
                if (this.fade._from.player.volume() <= 0.0) {
                    //Stoppt alten Track. --> Damit ist seek wieder 0.0 aber volume immer noch 0.0
                    this.fade._from.player.stop()
                    this.fade._from.player.seek(0)

                    console.debug(`Finished fading ${this.fade._from.data.name}`)

                    //Erhöhe Index auf nächsten Track, wenn current schneller ausgefadet ist.
                    if (this.fade._from.data.fadeOutDuration >= this.fade._to.data.fadeInDuration) {
                        this.fade.isCrossfading = false
                    }

                    this.fade._from.isFading = false
                    //EventListener wird entfernt
                    this.fade._from.player.off('fade')
                } else { //Wenn Track nicht fertig ausgefadet wurde. Wird bei Abbruch des Fades ausgeführt.
                    console.debug(`Fading from current ${this.fade._from.data.name} not finished!`)
                }
            })

            //Initialisiert nächsten Track, wenn 'undefined'
            if (typeof to.player === 'undefined') {
                to.player = new Howl({ src: [[this.audioPlayer.playlist.path, to.filename].join('%5C')], volume: 0.0, loop: to.isLooping })
                to.player.on('end', () => {
                    this.skipToNext()
                })
            }

            this.fade._to.player = to.player

            if (!to.player.playing()) {
                to.player.play()
            }

            //Beginnt den nächsten Track einzufaden
            to.player.fade(0.0, to.trackvolume, to.fadeInDuration)

            to.player.on('fade', () => {
                //Wenn Track fertig ausgefadet wurde. Wird bei Abbruch des Fades nicht ausgeführt.
                if (this.fade._to.player.volume() >= this.fade._to.data.trackvolume) {
                    console.debug(`Finished fading ${this.fade._to.data.name}`)

                    //Erhöhe Index auf nächsten Track, wenn next schneller ausfadet.
                    if (this.fade._to.data.fadeInDuration >= this.fade._to.data.fadeOutDuration) {
                        this.fade.isCrossfading = false
                    }

                    this.fade._to.isFading = false
                    //EventListener wird entfernt
                    this.fade._to.player.off('fade')
                } else { //Wenn Track nicht fertig ausgefadet wurde. Wird bei Abbruch des Fades ausgeführt.
                    console.debug(`Fading to next ${this.fade._to.data.name} not finished!`)
                }
            })
        },
        _pauseFade() {
            this.fade._from.player.pause()
            this.fade._to.player.pause()
        },
        _resumeFade() {
            //TODO Resume für weitere Fadearten erweitern            
            if (this.fade.isCrossfading) {
                if (this.fade._from.isFading) {
                    if (!this.fade._from.player.playing()) {
                        this.fade._from.player.play()
                    }
                    this.fade._from.player.fade(this.fade._from.player.volume(), 0.0, this.fade._from.data.fadeOutDuration)
                }

                if (this.fade._to.isFading) {
                    if (!this.fade._to.player.playing()) {
                        this.fade._to.player.play()
                    }
                    this.fade._to.player.fade(this.fade._to.player.volume(), this.fade._to.data.trackvolume, this.fade._to.data.fadeInDuration)
                }
            }
        },
        _stopFade() {
            if (typeof this.fade._from.player !== 'undefined') {
                this.fade._from.player.off('fade')

                //Faded letzten Song schnell aus --> Um Knacken zu verhindern 
                if (this.fade._from.isFading && this.fade._from.player.volume() > 0.0 && this.fade._from.player.playing()) {
                    this.fade._from.player.fade(this.fade._from.player.volume(), 0.0, 250)
                }


                this.fade._from.player.stop()
            }

            if (typeof this.fade._to.player !== 'undefined') {
                this.fade._to.player.off('fade')
            }

            this.fade._from.isFading = false
            this.fade._from.data = undefined
            this.fade._from.player = undefined

            this.fade._to.isFading = false
            this.fade._to.data = undefined
            this.fade._to.player = undefined
        },
        _isFading() {
            //Kann Error werfen, wenn _to oder _from 'undefined' ist.
            try {
                if (this.fade._to.isFading || this.fade._from.isFading) {
                    return true
                } else {
                    return false
                }
            } catch {
                return false
            }
        },
        garbageCollector() {
            if (this.audioPlayer.playlist.tracks.length > 3) {
                //TODO Hier alle unnötige Player löschen.
            }
        }
    },
    created() {
        //IMPORTANT Es wird für jeden Song ein neuer Player geladen.
        //IMPORTANT Im besten Fall sollten aber nur der Current, Next & Previous Track geladen werden.
        //TODO Implement load function: mit check, ob player existiert. Erstellt neuen Player
    },
    watch: {
        'audioPlayer.playlist'(newVal, oldVal) {
            try {
                if (oldVal.tracks[this.audioPlayer.oldIndex].player.playing()) {
                    //Player muss vorher erstellt sein, da ansonsten der Player nicht in Current übernommen wird
                    //Der Player wird auf undefined gesetzt, um Bugs und Überschreiben zu vermeiden.
                    this.audioPlayer.current.player = undefined
                    if(!this.audioPlayer.current.player === 'undefined'){
                        this.blockTrackChange = true
                        this.audioPlayer.current.player = new Howl({ src: [[this.audioPlayer.playlist.path, this.audioPlayer.current.filename].join('%5C')], volume: this.audioPlayer.current.trackvolume, loop: this.audioPlayer.current.isLooping })
                        this.audioPlayer.current.player.on('play', () => {
                            console.log('Block aus in Watcher')
                            this.blockTrackChange = false
                            this.audioPlayer.current.player.off('play')
                        })
                        console.log(this.audioPlayer.current.name, 'Block set in Watcher')
                        this.audioPlayer.current.player.on('end', () => {
                            this.skipToNext()
                        })
                    }
                    this.fade.crossfade(oldVal.tracks[this.audioPlayer.oldIndex], this.audioPlayer.current)

                }
            } catch {
                console.debug('Could not fade into new playlist')
            }
        },
        /**
         * Wird getriggert wenn Reset Song Button gedrückt wird
         */
        'audioPlayer.resetSong'() {
            this.fade.stop()
            this.blockTrackChange = false
        },
        seek() {
            //Use seek hier
        }
    }
}
</script>