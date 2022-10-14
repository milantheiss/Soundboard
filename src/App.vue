<template class="font-poppins font-normal">
  <p class="text-lg ml-5">{{audioPlayerStore.current.name}}</p>

  <button @click="switchPlaylist" class="border border-black m-6" :class="(isSzene1) ? 'bg-gray-300' : ''">Szene 1</button>
  <button @click="switchPlaylist" class="border border-black m-6" :class="(!isSzene1) ? 'bg-gray-300' : ''">Szene 2</button>

  <SoundeffectButton :soundeffect="audioPlayerStore.soundeffects[0]"></SoundeffectButton>
  <MediaControls></MediaControls>
</template>

<script>
import SoundeffectButton from '@/components/SoundeffectButton.vue';
import MediaControls from '@/components/MediaControls.vue';
import { useAudioPlayerStore } from '@/stores/audioPlayerStore.js'

export default {
  setup() {
    const audioPlayerStore = useAudioPlayerStore()

    return {
      audioPlayerStore
    }
  },
  data() {
    return {
      playlist1: [
        {
          name: "Szene 1Atmo 1",
          src: "./music/Szene1/ForestAmbiente1.wav",
          trackvolume: 1,
          isLooping: true,
          fadeOutDuration: 5000,
          fadeInDuration: 5000
        },
        {
          name: "Szene 1Atmo 2",
          src: "./music/Szene1/ForestAmbiente2.wav",
          trackvolume: 1,
          isLooping: true,
          fadeOutDuration: 2000,
          fadeInDuration: 2000
        }, {
          name: "Szene 1Magic Atmo",
          src: "./music/Szene1/MagicSound.wav",
          trackvolume: 1,
          isLooping: true,
          fadeOutDuration: 2000,
          fadeInDuration: 2000
        },
      ],
      playlist2: [
        {
          name: "Szene 2 Atmo 1",
          src: "./music/Szene2/ForestAmbienteWitcher1.wav",
          trackvolume: 1,
          isLooping: true,
          fadeOutDuration: 5000,
          fadeInDuration: 5000
        },
        {
          name: "Szene 2 Atmo 2",
          src: "./music/Szene2/ForestAmbienteWitcher2.wav",
          trackvolume: 1,
          isLooping: true,
          fadeOutDuration: 5000,
          fadeInDuration: 5000
        }
      ],
      isSzene1: true
    }
  },
  methods: {
    switchPlaylist() {
      if (this.isSzene1) {
        this.audioPlayerStore.playlist = this.playlist2
        this.isSzene1 = false
      } else {
        this.audioPlayerStore.playlist = this.playlist1
        this.isSzene1 = true
      }
    }
  },
  components: {
    SoundeffectButton,
    MediaControls
  }
}
</script>
  