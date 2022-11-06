<template>
    <div>
        <button @click="toggleLoop" class="w-fit inline-flex justify-center
        m-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2" v-show="!audioPlayer.isLooping">Start
            Loop</button>
        <button @click="toggleLoop" class="w-fit inline-flex justify-center
        m-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2" v-show="audioPlayer.isLooping">Stop
            Loop</button>

        <button @click="playPrev" class="
        w-fit inline-flex justify-center
        m-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2">Prev</button>

        <button @click="togglePlay" class="
        w-fit inline-flex justify-center
        m-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2" v-show="!audioPlayer.isPlaying">Play</button>
        <button @click="togglePlay" class="
        w-fit inline-flex justify-center
        m-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2" v-show="audioPlayer.isPlaying">Pause</button>

        <button @click="playNext" class="w-fit inline-flex justify-center
        m-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2">Next</button>
    </div>
</template>

<script>
import { Howl } from "howler"
import { useAudioPlayerStore } from '@/stores/audioPlayerStore.js'

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
            blockTrackChange: false
        }
    },
    methods: {
        togglePlay() {
            if (typeof this.audioPlayer.current !== 'undefined') {
                //Wenn für zu spielenden Song kein Player existiert, wird neuer erstellt.
                if (typeof this.audioPlayer.current.player === 'undefined') {
                    //INFO Path ist die API URL aus Tauri
                    //Siehe https://tauri.app/v1/api/js/tauri#convertfilesrc
                    this.audioPlayer.current.player = new Howl({ src: [[this.audioPlayer.playlist.path, this.audioPlayer.current.filename].join('%5C')], volume: this.audioPlayer.current.trackvolume, loop: this.audioPlayer.current.isLooping })
                    this.blockTrackChange = true
                    this.audioPlayer.current.player.on('load', () => { this.blockTrackChange = false })
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
        playNext() {
            //Muss Next blockieren, da loading von Howl Player lange braucht. Es entsteht ansonsten ein Bug, wenn man Next bei undefined Player spamt
            if (!this.blockTrackChange) {
                if (typeof this.audioPlayer.current !== 'undefined') {
                    //Wenn schon ein Song gespielt wird, dann starte Crossfade
                    if (this.audioPlayer.isPlaying) {
                        if (typeof this.audioPlayer.next.player === 'undefined') {
                            this.blockTrackChange = true
                            this.audioPlayer.next.player = new Howl({ src: [[this.audioPlayer.playlist.path, this.audioPlayer.next.filename].join('%5C')], volume: 0.0, loop: this.audioPlayer.next.isLooping })
                            this.audioPlayer.next.player.on('load', () => {
                                this.blockTrackChange = false
                            })
                        }
                        this.fade.crossfade(this.audioPlayer.current, this.audioPlayer.next)
                    } else { //Wenn Song nicht spielt, wird der Fade sicherheitshalber gecleart und das Volume angepasst.
                        this.fade.stop()
                        if (typeof this.audioPlayer.next.player !== 'undefined') {
                            this.audioPlayer.next.player.volume(this.audioPlayer.next.trackvolume)
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
                        if (typeof this.audioPlayer.previous.player === 'undefined') {
                            this.blockTrackChange = true
                            this.audioPlayer.previous.player = new Howl({ src: [[this.audioPlayer.playlist.path, this.audioPlayer.previous.filename].join('%5C')], volume: 0.0, loop: this.audioPlayer.previous.isLooping })
                            this.audioPlayer.previous.player.on('load', () => {
                                this.blockTrackChange = false
                            })
                        }
                        this.fade.crossfade(this.audioPlayer.current, this.audioPlayer.previous)
                    } else { //Wenn Song nicht spielt, wird der Fade sicherheitshalber gecleart und das Volume angepasst.
                        this.fade.stop()
                        if (typeof this.audioPlayer.previous.player !== 'undefined') {
                            this.audioPlayer.previous.player.volume(this.audioPlayer.previous.trackvolume)
                        }
                    }
                    //Der Index wird verschoben
                    this.audioPlayer.advanceToPreviousIndex()
                } else {
                    console.error("No current track loaded");
                }
            } else {
                console.log(this.blockTrackChange);
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

            this.fade._from.isFading = false
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
                    this.fade.crossfade(oldVal.tracks[this.audioPlayer.oldIndex], newVal.tracks[0])
                }
            } catch {
                console.debug('Could not fade into new playlist')
            }
        }
    }
}
</script>