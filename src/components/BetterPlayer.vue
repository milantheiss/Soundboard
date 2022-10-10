<template>
    <p>{{current.title}}</p>
    <button @click="setLoop" class="border border-black m-6">Loop</button>
    <button @click="reset" class="border border-black m-6" v-show="isPlaying">Reset</button>
    <button @click="togglePlay" class="border border-black m-6" v-show="!isPlaying">Play</button>
    <button @click="togglePlay" class="border border-black m-6" v-show="isPlaying">Pause</button>
    <button @click="testnext" class="border border-black m-6">Next</button>
</template>

<script>
export default {
    name: "BetterPlayer",
    data() {
        return {
            audio: new Audio(),
            audioContext: new AudioContext(),
            gainNode: undefined,
            track: undefined,
            isPlaying: false,
            index: 0,
            playlist: [
                {
                    title: "Song of Storms - Ocarina of Time",
                    src: "./music/Song of Storms - Ocarina of Time.wav",
                    trackvolume: 1.0,
                    fadeOutDuration: 5,
                    fadeInDuration: 10
                },
                {
                    title: "Warcraft Theme",
                    src: "./music/Warcraft The Beginning Soundtrack - (01) Warcraft.mp3",
                    trackvolume: 1.0,
                    fadeOutDuration: 5,
                    fadeInDuration: 10
                },
                {
                    title: "Gerudo Valley - Ocarina of Time",
                    src: "./music/Gerudo Valley - Ocarina of Time.wav",
                    trackvolume: 0.5,
                    fadeOutDuration: 5,
                    fadeInDuration: 10
                },
                {
                    title: "Szene 6 (Sommernacht 3) - Atomsphere 1",
                    src: "./music/ForestAmbienteSample1.wav",
                    trackvolume: 0.5,
                    fadeOutDuration: 5,
                    fadeInDuration: 10
                },
                {
                    title: "Szene 6 (Sommernacht 3) - Atomsphere 2",
                    src: "./music/ForestAmbienteSample2.wav",
                    trackvolume: 1.0,
                    fadeOutDuration: 2.5,
                    fadeInDuration: 1.3
                }
            ],
            current: {}
        }
    },
    methods: {
        async togglePlay() {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                this.isPlaying = true
            }

            if (this.isPlaying) {
                this.isPlaying = false
                return this.audio.pause();
            }

            this.isPlaying = true
            return this.audio.play();
        },
        testnext() {
            //const curve = this.createLogarithmicBuffer(-1, this.audioContext.sampleRate)
            const waveArray = new Float32Array(2);
            waveArray[0] = 0.5;
            waveArray[1] = 0.0;
            const start = this.audioContext.currentTime

            this.gainNode.gain.setValueCurveAtTime(waveArray, start, this.current.fadeOutDuration);

            console.log("Playing Next");
            this.index++;
            if (this.index > this.playlist.length - 1) {
                this.index = 0;
            }
            this.current = this.playlist[this.index];
            this.audio.src = this.current.src;
            console.log("Setting Volume");
            setTimeout(() => {
                this.audio.play();
                this.gainNode.gain.value = this.current.trackvolume
                console.log("Setting Playing");
            }, 100)
        },
        next() {
            //Setzt Timestamp eventhandler ontimechange if timestamp erreicht exec song wechsel

            const _next = () => {
                console.log("Playing Next");
                this.index++;
                if (this.index > this.playlist.length - 1) {
                    this.index = 0;
                }
                this.current = this.playlist[this.index];
                this.audio.src = this.current.src;
                console.log("Setting Volume");
                setTimeout(() => {
                    this.audio.play();
                    this.gainNode.gain.value = this.current.trackvolume
                    console.log("Setting Playing");
                }, 100)
            }

            if (this.isPlaying) {
                this.fadeOut()
                setTimeout(() => {
                    _next()
                }, this.current.fadeOutDuration * 1000)
            } else {
                _next()
            }

            //this.fadeIn(this.current.fadeInDuration
        },
        fadeOut(duration = this.current.fadeOutDuration) {
            console.log(`Fading out for ${duration} millisec`);

            //const curve = this.createLogarithmicBuffer(-1, this.audioContext.sampleRate)
            const waveArray = new Float32Array(2);
            waveArray[0] = 0.5;
            waveArray[1] = 0.0;
            const start = this.audioContext.currentTime

            this.gainNode.gain.setValueCurveAtTime(waveArray, start, duration);
            console.log("going further");
        },
        //creating a curve to simulate a logarithmic curve with setValueCurveAtTime.
        createLogarithmicBuffer(direction, base = 10, length = 48000) {
            console.log(base);
            let curve = new Float32Array(length)

            for (let i = 0; i < length; i++) {
                //index for the curve array.
                //direction positive for fade in, negative for fade out
                const index = direction > 0 ? i : length - 1 - i;

                const percent = i / length;
                curve[index] = Math.log(1 + base * percent) / Math.log(1 + base);
            }

            return curve;
        }
    },
    created() {
        this.current = this.playlist[0];
        this.audio.src = this.current.src;

        this.track = this.audioContext.createMediaElementSource(this.audio)
        this.gainNode = this.audioContext.createGain()

        this.track
            .connect(this.gainNode)
            .connect(this.audioContext.destination)

        this.gainNode.gain.value = this.current.trackvolume
    },
    computed: {

    }
}
</script>