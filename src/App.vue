<template class="font-poppins font-normal">
  <p class="text-lg ml-5">{{audioPlayerStore.current.name}}</p>
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
      soundeffects: [
        {
          name: "Zelda Chest",
          src: "./soundeffects/Zelda Open Chest.mp3",
          trackvolume: 0.5,
          isLooping: true,
          fadeOutDuration: 1000,
          fadeInDuration: 0
        }
      ],
      playlist: [
        {
          name: "Song of Storms",
          src: "./music/Song of Storms - Ocarina of Time.wav",
          trackvolume: 0.1,
          isLooping: true,
          fadeOutDuration: 5000,
          fadeInDuration: 10000
        },
        {
          name: "Warcraft Theme",
          src: "./music/Warcraft The Beginning Soundtrack - (01) Warcraft.mp3",
          trackvolume: 1.0,
          isLooping: false,
          fadeOutDuration: 5000,
          fadeInDuration: 10000
        },
        {
          name: "Gerudo Valley",
          src: "./music/Gerudo Valley - Ocarina of Time.wav",
          trackvolume: 0.1,
          isLooping: false,
          fadeOutDuration: 5000,
          fadeInDuration: 1000
        }
      ],
      
    }
  },
  components: {
    SoundeffectButton,
    MediaControls
  },
  created() {
    this.audioPlayerStore.playlist = this.playlist
    this.audioPlayerStore.soundeffect = this.soundeffects
  }
}
</script>
  