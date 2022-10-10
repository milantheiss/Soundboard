<template>
    <p>{{current.title}}</p>
    <button @click="setLoop" class="border border-black m-6">Loop</button>
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
                    trackvolume: 1.0,
                    fadeOutDuration: 5000,
                    fadeInDuration: 10000,
                    player: undefined
                },
                {
                    title: "Warcraft Theme",
                    src: "./music/Warcraft The Beginning Soundtrack - (01) Warcraft.mp3",
                    trackvolume: 1.0,
                    fadeOutDuration: 5000,
                    fadeInDuration: 10000,
                    player: undefined
                },
                {
                    title: "Gerudo Valley - Ocarina of Time",
                    src: "./music/Gerudo Valley - Ocarina of Time.wav",
                    trackvolume: 0.5,
                    fadeOutDuration: 5000,
                    fadeInDuration: 1000,
                    player: undefined
                }
            ],
            fadingToNext: false,
            fadingToPrev: false,
        }
    },
    methods: {
        async togglePlay() {
            //TODO TogglePlay blocken, wenn noch keine Playlist geladen ist.
            //TODO Wenn nicht gecrossfadet wird, müssen Next & Prev anders pausiert/abgespielt werden

            //Wenn für zu spielenden Song kein Player existiert, wird neuer erstellt.
            if (typeof this.current.player === 'undefined') {
                this.current.player = new Howl({ src: [this.current.src], volume: this.current.volume })
            }
            if (this.current.player.playing()) {
                //Pausiert wenn Sound abgespielt wird. 
                console.debug("Player is paused.")

                //Nur bei Crossfade wichtig: Pausieren auch Next & Previous, wenn in Fading Process wurde
                if (this.fadingToNext) {
                    this.next.player.pause()
                } else if (this.fadingToPrev) {
                    this.previous.player.pause()
                }
                this.current.player.pause();
            } else {
                //Startet wenn noch kein Sound gespielt wird.
                console.debug(`Now playing: ${this.current.title}`)

                //Nur bei Crossfade wichtig: Startet auch Next & Previous, wenn in Fading Process pausiert wurde
                if (this.fadingToNext) {
                    this.next.player.play()
                } else if (this.fadingToPrev) {
                    this.previous.player.play()
                }
                this.current.player.play();
            }
        },
        toggleLoop(){
            //TODO Toggle Loop über Button
        },
        playNext() {
            //TODO Hier ein IF Statement einbauen, um Crossfade um/auszuschalten
            //INFO Im Moment Crossfade vom current zum next Track

            this.fadingToNext = true
            this.crossfade(this.current, this.next)

            //Sobald zum nächstem gefadet wurde zu nächstem fertig ist.
            this.next.player.once('fade', () => {
                if (this.current.fadeOutDuration < this.next.fadeInDuration) {
                    this.fadingToNext = false
                }
                console.debug(`Finished fading ${this.next.title}`)

                //Erhöhe Index auf nächsten Track
                this.currentIndex++;
                if (this.currentIndex > this.playlist.length - 1) {
                    this.currentIndex = 0;
                }
            })
        },
        crossfade(from, to) {
            //INFO Fade Duration in ms

            console.debug(`Crossfading from ${from.title} to ${to.title} track`)

            //Faded spielenden Track aus, für die FadeOutDuration des Tracks
            from.player.fade(from.trackvolume, 0.0, from.fadeOutDuration)

            //Stoppt alten Track, sobald ausgefadet.
            from.player.once('fade', () => {
                from.player.stop()
                console.debug(`Finished fading ${from.title}`)
                if (from.fadeOutDuration > to.fadeInDuration) {
                    this.fadingToNext = false
                }
            })

            //Spring zum nächsten Track und beginnt ihn zu spielen.
            if (typeof to.player === 'undefined') {
                to.player = new Howl({ src: [to.src], volume: to.volume })
            }

            to.player.play()

            //Beginnt den nächsten Track einzufaden
            to.player.fade(0.0, to.trackvolume, to.fadeInDuration)
        },
        garbageCollector() {
            if (this.playlist.length > 3) {
                //TODO Hier alle unnötige Player löschen.
            }
        }
    },
    created() {
        //IMPORTANT Es muss immer eine Playlist/Song selected sein, um Howl erstellen zu können.
        //IMPORTANT Wenn einen neue Playlist geladen werden soll, muss zu
        //TODO Block auf alle Funktion bis Howl geloaded & Auto select für Playlisten
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
                return this.playlist[this.playlist.length]
            } else {
                return this.playlist[this.currentIndex - 1]
            }
        }
    }
}
</script>