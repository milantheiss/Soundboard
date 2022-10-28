<template>
    <div>
        <button @click="playSoundeffect" class="border border-black m-6" :class="(this.effect.player.playing() && !this.isStopping) ? 'bg-gray-300' : ''">{{effect.name}}</button>
    </div>
</template>

<script>
import { Howl } from "howler"

export default {
    name: "SoundeffectButton",
    data() {
        return {
            effect: {
                name: undefined,
                src: undefined,
                trackvolume: undefined,
                isLooping: undefined,
                fadeOutDuration: undefined,
                fadeInDuration: undefined,
                player: undefined
            },
            isStarting: false,
            isStopping: false
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
            if (!this.effect.player.playing() || this.isStopping) {
                console.debug(`Now playing soundeffect: ${this.effect.name}`)
                this.startEffect();
            } else { //Startet wenn noch kein Sound gespielt wird.
                console.debug(`Soundeffect ${this.effect.name} was stoped.`)
                this.stopEffect()
            }
        },
        startEffect() {
            //Wenn Effekt neugestartet wird, wären er noch läuft. --> z.B. Stopping Fade läuft noch
            if (this.effect.player.playing()) {
                //Effekt wird schnell auf Vol 0 gezogen.
                this.effect.player.fade(this.effect.player.volume(), 0.0, 250)

                //Sobald er auf Vol 0 ist, wir Fade In gestartet
                this.effect.player.once('fade', () => {
                    this.effect.player.play()
                    this.effect.player.fade(0.0, this.effect.trackvolume, this.effect.fadeInDuration)
                    this.isStarting = true
                })
            } else { //Wenn Effekt nicht spielt, wird er normal von Vol 0 gestartet.
                this.effect.player.play()    
                this.effect.player.fade(0.0, this.effect.trackvolume, this.effect.fadeInDuration)
                this.isStarting = true
            }

            this.effect.player.once('fade', () => {
                //Wenn Track fertig ausgefadet wurde
                console.debug(`Finished starting ${this.effect.name}`)

                this.isStarting = false
            })
        },
        stopEffect() {
            //Fadet Effekt zu Vol 0 in der FadeOutDuration des Effekts aus
            this.effect.player.fade(this.effect.player.volume(), 0.0, this.effect.fadeOutDuration)

            this.isStopping = true

            this.effect.player.once('fade', () => {
                //Stoppt wenn Vol 0 den Effekt komplett. --> Damit beginnt er beim nächsten play() bei seek 0
                this.effect.player.stop()

                console.debug(`Finished stopping ${this.effect.name}`)

                this.isStopping = false
            })
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
        }
    },
    created() {
        this.effect = this.soundeffect
        this.effect.player = new Howl({ src: [this.effect.src], volume: this.effect.trackvolume, loop: this.effect.isLooping })
    },
    computed: {
        isPlaying() {
            //Try Catch, da der Player nicht umbedingt schon existiert.
            try {
                return this.effect.player.playing()
            } catch (e) {
                return false
            }
        }
    },
    watch: {
        soundeffect(newVal) {            
            console.log('auch am start')
            if (typeof this.effect.player !== 'undefined') {
                if (!this.effect.player.playing()) {
                    this.effect.player.unload()

                    this.effect = newVal
                    this.effect.player = new Howl({ src: [newVal.src], volume: newVal.trackvolume, loop: newVal.isLooping })
                } else {
                    this.effect.player.loop(newVal.isLooping)
                    this.effect.player.volume(newVal.trackvolume)

                    this.effect.name = newVal.name
                    this.effect.src = newVal.src
                    this.effect.trackvolume = newVal.trackvolume
                    this.effect.isLooping = newVal.isLooping
                    this.effect.fadeOutDuration = newVal.fadeOutDuration
                    this.effect.fadeInDuration = newVal.fadeInDuration

                    this.effect.player.on('stop', () => {
                        this.effect.player.unload()

                        this.effect.player = new Howl({ src: [newVal.src], volume: newVal.trackvolume, loop: newVal.isLooping })
                    })
                }
            } else {
                this.effect = this.soundeffect
                this.effect.player = new Howl({ src: [this.effect.src], volume: this.effect.trackvolume, loop: this.effect.isLooping })
            }
        }
    }
}
</script>