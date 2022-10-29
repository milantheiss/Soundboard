<template class="font-poppins font-normal">
<p class="text-lg ml-5" v-if="typeof audioPlayerStore.current !== 'undefined'">{{audioPlayerStore.current.name}}</p>

  <button @click="switchPlaylist" class="border border-black m-6" :class="(isSzene1) ? 'bg-gray-300' : ''">Szene 1</button>
  <button @click="switchPlaylist" class="border border-black m-6" :class="(!isSzene1) ? 'bg-gray-300' : ''">Szene 2</button>

  <button @click="selectPlaylist" class="border border-black m-6">Playlist laden</button>

  <SoundeffectButton :soundeffect="audioPlayerStore.soundeffects[0]" v-if="audioPlayerStore.soundeffects.length > 0"></SoundeffectButton>
  <MediaControls></MediaControls>
</template>

<script>
import SoundeffectButton from '@/components/SoundeffectButton.vue';
import MediaControls from '@/components/MediaControls.vue';
import { useAudioPlayerStore } from '@/stores/audioPlayerStore.js'
import { loadPlaylist } from './util/fileManager';

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
          name: "Szene 1 Atmo 1",
          src: "./music/Szene1/ForestAmbiente1.wav",
          trackvolume: 1,
          isLooping: true,
          fadeOutDuration: 5000,
          fadeInDuration: 5000
        },
        {
          name: "Szene 1 Atmo 2",
          src: "./music/Szene1/ForestAmbiente2.wav",
          trackvolume: 1,
          isLooping: true,
          fadeOutDuration: 2000,
          fadeInDuration: 2000
        }, {
          name: "Szene 1 Magic Atmo",
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
        this.audioPlayerStore.setPlaylist(this.playlist2)
        this.isSzene1 = false
      } else {
        this.audioPlayerStore.setPlaylist(this.playlist1)
        this.isSzene1 = true
      }
    },
    async selectPlaylist(){
      this.audioPlayerStore.setPlaylist(await loadPlaylist())
    }
  },
  components: {
    SoundeffectButton,
    MediaControls
  }
}
</script>
  