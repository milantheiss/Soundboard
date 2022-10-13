<template>
    <div>
        <button @click="playSoundeffect" class="border border-black m-6">{{_soundeffect.name}}</button>
    </div>
</template>

<script>
import { Howl } from "howler"

export default {
    name: "SoundeffectButton",
    data() {
        return {
            // eslint-disable-next-line vue/no-reserved-keys
            _soundeffect: {
                name: undefined,
                src: undefined,
                trackvolume: undefined,
                isLooping: undefined,
                fadeOutDuration: undefined,
                fadeInDuration: undefined,
                player: undefined
            },
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
                stop: this._stopFade,
                _newFadeBlocked: false
            },
            isFading: false
        }
    },
    props: {
        soundeffect: {
            name: String,
            src: String,
            trackvolume: Float32Array,
            isLooping: Boolean,
            fadeOutDuration: Int32Array,
            fadeInDuration: Int32Array
        }
    },
    methods: {
        async playSoundeffect() {
            //Pausiert wenn Sound abgespielt wird. 
            if (this._soundeffect.player.playing()) {
                console.debug(`Soundeffect ${this._soundeffect.name} was stoped.`)
                this.stopEffect()
            } else { //Startet wenn noch kein Sound gespielt wird.
                console.debug(`Now playing soundeffect: ${this._soundeffect.name}`)

                this.startEffect();
            }
        },
        startEffect() {

            if (!this._soundeffect.player.playing()) {
                this._soundeffect.player.play()
            }

            //Beginnt den nächsten Track einzufaden
            this._soundeffect.player.fade(0.0, this._soundeffect.trackvolume, this._soundeffect.fadeInDuration)

            this._soundeffect.player.once('fade', () => {
                //Wenn Track fertig ausgefadet wurde. Wird bei Abbruch des Fades nicht ausgeführt.
                console.debug(`Finished fading ${this._soundeffect.name}`)
            })
        },
        stopEffect() {
            console.debug(`Fading `)

            //Faded spielenden Track aus, für die FadeOutDuration des Tracks
            from.player.fade(from.player.volume(), 0.0, from.fadeOutDuration)

            from.player.on('fade', () => {
                //Wenn Track fertig ausgefadet wurde. Wird bei Abbruch des Fades nicht ausgeführt.
                if (this.fade._from.player.volume() <= 0.0) {
                    this.fade._from.isFading = false

                    //Stoppt alten Track. --> Damit ist seek wieder 0.0 aber volume immer noch 0.0
                    this.fade._from.player.stop()

                    console.debug(`Finished fading ${this.fade._from.data.name}`)

                    //Erhöhe Index auf nächsten Track, wenn current schneller ausgefadet ist.
                    if (this.fade._from.data.fadeOutDuration <= this.fade._to.data.fadeInDuration) {
                        console.debug("Triggered by current: Advanced to next track.")
                    } else {
                        this.fade.isCrossfading = false
                    }

                    this.fade._from.isFading = false
                    //EventListener wird entfernt
                    this.fade._from.player.off('fade')
                } else { //Wenn Track nicht fertig ausgefadet wurde. Wird bei Abbruch des Fades ausgeführt.
                    console.debug(`Fading from current ${this.fade._from.data.name} not finished!`)
                }

            })


            //Faded letzten Song schnell aus --> Um Knacken zu verhindern 
            if (this.fade._from.isFading && this.fade._from.player.volume() > 0.0 && this.fade._from.player.playing()) {
                this.fade._from.player.fade(this.fade._from.player.volume(), 0.0, 250)
            }

            this.fade._to.player.off('fade')
            this.fade._from.player.off('fade')

            this.fade._from.data = undefined
            this.fade._from.player = undefined

            this.fade._to.data = undefined
            this.fade._to.player = undefined
        },
        playNext() {
            //Start to crossfade
            if (this.isPlaying) {
                //Loop des alten Players wird beim starten des nächsten Players aufgehoben
                this.current.player.loop(false)
                this.current.isLooping = false

                this.fade.crossfade(this.current, this.next, true)
            } else {
                this.fade.stop()
                this.next.player.volume(this.next.trackvolume)
            }
            this._advanceToNextIndex()
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
        
        _advanceToNextIndex() {
            //Erhöht Index
            if (this.currentIndex + 1 > this.playlist.length - 1) {
                this.currentIndex = 0;
            } else {
                this.currentIndex++;
            }
        },
        _advanceToPreviousIndex() {
            //Verringert Index
            this.currentIndex++;
            if (this.currentIndex < 0) {
                this.currentIndex = this.playlist.length - 1;
            }
        },
        _isFading() {
            //Kann Error werfen, wenn _to oder _from 'undefined' ist.
            try {
                if (this.fade._to.isFading || this.fade._from.isFading) {
                    return true
                }
            } catch {
                return false
            }
        },
        garbageCollector() {
            if (this.playlist.length > 3) {
                //TODO Hier alle unnötige Player löschen.
            }
        }
    },
    created() {
        this._soundeffect = this.soundeffect
        this._soundeffect.player = new Howl({ src: [this._soundeffect.src], volume: this._soundeffect.trackvolume, loop: this._soundeffect.isLooping })
    },
    computed: {
        isPlaying() {
            //Try Catch, da der Player nicht umbedingt schon existiert.
            try {
                return this._soundeffect.player.playing()
            } catch (e) {
                return false
            }
        }
    },
    watch: {
        soundeffect(newVal) {
            if (typeof this._soundeffect.player !== 'undefined') {
                if (!this._soundeffect.player.playing()) {
                    this._soundeffect.player.unload()

                    this._soundeffect = newVal
                    this._soundeffect.player = new Howl({ src: [newVal.src], volume: newVal.trackvolume, loop: newVal.isLooping })
                } else {
                    this._soundeffect.player.loop(newVal.isLooping)
                    this._soundeffect.player.volume(newVal.trackvolume)

                    this._soundeffect.name = newVal.name
                    this._soundeffect.src = newVal.src
                    this._soundeffect.trackvolume = newVal.trackvolume
                    this._soundeffect.isLooping = newVal.isLooping
                    this._soundeffect.fadeOutDuration = newVal.fadeOutDuration
                    this._soundeffect.fadeInDuration = newVal.fadeInDuration

                    this._soundeffect.player.on('stop', () => {
                        this._soundeffect.player.unload()

                        this._soundeffect.player = new Howl({ src: [newVal.src], volume: newVal.trackvolume, loop: newVal.isLooping })
                    })
                }
            } else {
                this._soundeffect = this.soundeffect
                this._soundeffect.player = new Howl({ src: [this._soundeffect.src], volume: this._soundeffect.trackvolume, loop: this._soundeffect.isLooping })
            }
        }
    }
}
</script>