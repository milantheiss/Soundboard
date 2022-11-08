<template>
    <span></span>
</template>

<script>
import { useAudioPlayerStore } from '@/stores/audioPlayerStore.js'

export default {
    name: "SeekUpdater",
    setup() {
        const audioPlayer = useAudioPlayerStore()

        return {
            audioPlayer
        }
    },
    data(){
        return{
            seek: undefined
        }
    },
    props: {
        modelValue: Number
    }, 
    emits: ['update:modelValue', 'onChange', 'on'],    
    expose: ['seek'], 
    methods: {
        startUpdates() {
            setInterval(() => {
                if (typeof this.audioPlayer.current !== 'undefined') {
                    if (typeof this.audioPlayer.current.player !== 'undefined') {
                        if (this.audioPlayer.current.player.playing()) {
                            this.$emit('update:modelValue', this.audioPlayer.current.player.seek())
                            this.seek = this.audioPlayer.current.player.seek()
                        }
                    }
                }
            }, 250);
        }
    },
    mounted() {
        this.startUpdates()
    }
}
</script>