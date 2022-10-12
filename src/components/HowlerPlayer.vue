<template>
    <p>{{current.title}}</p>
    <button @click="toggleLoop" class="border border-black m-6" v-show="!isLooping">Start Loop</button>
    <button @click="toggleLoop" class="border border-black m-6" v-show="isLooping">Stop Loop</button>
    <button @click="reset" class="border border-black m-6" v-show="isPlaying">Reset</button>
    <button @click="togglePlay" class="border border-black m-6" v-show="!isPlaying">Play</button>
    <button @click="togglePlay" class="border border-black m-6" v-show="isPlaying">Pause</button>
    <button @click="playNext" class="border border-black m-6">Next</button>
</template>

<script>
import { Howl } from "howler"

export default {
    name: "HowlerPlayer",
    data() {
        return {
            currentIndex: 0,
            playlist: [
                {
                    title: "Song of Storms - Ocarina of Time",
                    src: "./music/Song of Storms - Ocarina of Time.wav",
                    trackvolume: 0.1,
                    isLooping: true,
                    fadeOutDuration: 5000,
                    fadeInDuration: 10000,
                    player: undefined
                },
                {
                    title: "Warcraft Theme",
                    src: "./music/Warcraft The Beginning Soundtrack - (01) Warcraft.mp3",
                    trackvolume: 1.0,
                    isLooping: false,
                    fadeOutDuration: 5000,
                    fadeInDuration: 10000,
                    player: undefined
                },
                {
                    title: "Gerudo Valley - Ocarina of Time",
                    src: "./music/Gerudo Valley - Ocarina of Time.wav",
                    trackvolume: 0.1,
                    isLooping: false,
                    fadeOutDuration: 5000,
                    fadeInDuration: 1000,
                    player: undefined
                }
            ],
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
            }
        }
    },
    methods: {
        async togglePlay() {
            //TODO Wenn nicht gecrossfadet wird, müssen Next & Prev anders pausiert/abgespielt werden

            //Wenn für zu spielenden Song kein Player existiert, wird neuer erstellt.
            if (typeof this.current.player === 'undefined') {
                this.current.player = new Howl({ src: [this.current.src], volume: this.current.trackvolume, loop: this.current.isLooping })
                this.next.player = new Howl({ src: [this.next.src], volume: 0.0, loop: this.next.isLooping })
                this.previous.player = new Howl({ src: [this.previous.src], volume: 0.0, loop: this.previous.isLooping })
            }

            //Pausiert wenn Sound abgespielt wird. 
            if (this.current.player.playing()) {
                console.debug("Player was paused.")

                //Nur bei Crossfade wichtig: Pausieren auch Next & Previous, wenn in Fading Process wurde
                if (this.fade.isFading()) {
                    this.fade.pause()
                } else {
                    this.current.player.pause()
                }
            } else { //Startet wenn noch kein Sound gespielt wird.

                console.debug(`Now playing: ${this.current.title}`)

                //Nur bei Crossfade wichtig: Startet auch Next & Previous, wenn in Fading Process pausiert wurde
                if (this.fade.isFading()) {
                    console.debug("Fade triggered from togglePlay()")
                    this.fade.resume()
                } else {
                    this.current.player.play();
                }
            }
        },
        toggleLoop() {
            //TODO Toggle Loop über Button
            this.current.isLooping = !this.current.isLooping
            console.debug("Player is looping",this.isLooping)
            //Error catch, falls noch kein Player existiert
            if(!(typeof this.current.player === 'undefined')){
                this.current.player.loop(this.isLooping)
            }
            
        },
        playNext() {
            //Start to crossfade
            if(this.isPlaying){
                //Loop des alten Players wird beim starten des nächsten Players aufgehoben
                this.current.player.loop(false)
                this.current.isLooping = false

                this.fade.crossfade(this.current, this.next, true)
            } else {
                this.next.player.volume(this.next.trackvolume)
            }
            this._advanceToNextIndex()
        },
        _startCrossfade(from, to) {
            //INFO Fade Duration in ms

            if (!this.fade._newFadeBlocked) {

                //Stoppt Fade, wenn neuer Fade angefangen wird.
                this.fade.stop()
    
                //Setup _from und _to (neu)
                this.fade._from.data = from
                this.fade._from.player = from.player
    
                this.fade._to.data = to
                this.fade._to.player = to.player
    
                this.fade._from.isFading = true
                this.fade._to.isFading = true
    
                this.fade.isCrossfading = true
    
                console.debug(`Fading from ${from.title} to ${to.title}`)
    
                //Faded spielenden Track aus, für die FadeOutDuration des Tracks
                from.player.fade(from.player.volume(), 0.0, from.fadeOutDuration)
    
                from.player.on('fade', () => {
                    //Wenn Track fertig ausgefadet wurde. Wird bei Abbruch des Fades nicht ausgeführt.
                    if (this.fade._from.player.volume() <= 0.0) {
                        this.fade._from.isFading = false
    
                        //Stoppt alten Track. --> Damit ist seek wieder 0.0 aber volume immer noch 0.0
                        this.fade._from.player.stop()
    
                        console.debug(`Finished fading ${this.fade._from.data.title}`)
    
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
                        console.debug(`Fading from current ${this.fade._from.data.title} not finished!`)
                    }
    
                })
    
                //Initialisiert nächsten Track, wenn 'undefined'
                if (typeof to.player === 'undefined') {
                    to.player = new Howl({ src: [to.src], volume: 0.0 })
                }
    
                if(!to.player.playing()){
                    to.player.play()
                }
    
                //Beginnt den nächsten Track einzufaden
                to.player.fade(0.0, to.trackvolume, to.fadeInDuration)
    
                to.player.on('fade', () => {
                    //Wenn Track fertig ausgefadet wurde. Wird bei Abbruch des Fades nicht ausgeführt.
                    if (this.fade._to.player.volume() >= this.fade._to.data.trackvolume) {
                        this.fade._to.isFading = false
    
                        console.debug(`Finished fading ${this.fade._to.data.title}`)
    
                        //Erhöhe Index auf nächsten Track, wenn next schneller ausfadet.
                        if (this.fade._to.data.fadeInDuration <= this.fade._to.data.fadeOutDuration) {
                            console.debug("Triggered by: Advanced to next track.")
                        } else {
                            this.fade.isCrossfading = false
                        }
    
                        this.fade._to.isFading = false
                        //EventListener wird entfernt
                        this.fade._to.player.off('fade')
                    } else { //Wenn Track nicht fertig ausgefadet wurde. Wird bei Abbruch des Fades ausgeführt.
                        console.debug(`Fading to next ${this.fade._to.data.title} not finished!`)
                    }
                })
            } else {
                console.error("Next song was blocked!")
            }
        },
        _pauseFade() {
            if (this.fade._from.isFading) {
                this.fade._from.player.pause()
            }

            if (this.fade._to.isFading) {
                this.fade._to.player.pause()
            }
        },
        _resumeFade() {
            //TODO Resume für weitere Fadearten erweitern            
            if (this.fade.isCrossfading) {
                if (this.fade._from.isFading) {
                    if(!this.fade._from.player.playing()){
                        this.fade._from.player.play()
                    }
                    this.fade._from.player.fade(this.fade._from.player.volume(), 0.0, this.fade._from.data.fadeOutDuration)
                }

                if (this.fade._to.isFading) {
                    if(!this.fade._from.player.playing()){
                        this.fade._to.player.play()
                    }
                    this.fade._to.player.fade(this.fade._to.player.volume(), this.fade._to.data.trackvolume, this.fade._to.data.fadeInDuration)
                }
            }
        },
        _stopFade(){
            //Faded letzten Song schnell aus --> Um Knacken zu verhindern 
            if (this.fade._from.isFading && this.fade._from.player.volume() > 0.0) {
                this.fade._from.player.fade(this.fade._from.player.volume(), 0.0, 250)
            }

            this.fade._from.data = undefined
            this.fade._from.player = undefined

            this.fade._to.data = undefined
            this.fade._to.player = undefined
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
        //IMPORTANT Es wird für jeden Song ein neuer Player geladen.
        //IMPORTANT Im besten Fall sollten aber nur der Current, Next & Previous Track geladen werden.
        //TODO Implement load function: mit check, ob player existiert. Erstellt neuen Player
    },
    computed: {
        isPlaying() {
            //Try Catch, da der Player nicht umbedingt schon existiert.
            try {
                return this.current.player.playing()
            } catch (e) {
                return false
            }
        },
        isLooping(){
            return this.current.isLooping
        },
        current() {
            return this.playlist[this.currentIndex]
        },
        next() {
            if (this.currentIndex + 1 > this.playlist.length - 1) {
                return this.playlist[0]
            } else {
                return this.playlist[this.currentIndex + 1]
            }
        },
        previous() {
            if (this.currentIndex - 1 < 0) {
                return this.playlist[this.playlist.length - 1]
            } else {
                return this.playlist[this.currentIndex - 1]
            }
        }
    }
}
</script>