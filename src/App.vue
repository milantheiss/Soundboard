<template class="font-poppins font-normal">
  <p class="text-lg mt-6 mb-0 mx-6" v-if="typeof audioPlayerStore.current !== 'undefined'">{{ audioPlayerStore.current.name }}</p>
  <p class="text-lg mt-6 mb-0 mx-6" v-if="typeof audioPlayerStore.current === 'undefined'">Keine Playlist ausgewählt.</p>

  <!--
  <button @click="switchPlaylist" class="border border-black m-6" :class="(isSzene1) ? 'bg-gray-300' : ''">Szene
    1</button>
  <button @click="switchPlaylist" class="border border-black m-6" :class="(!isSzene1) ? 'bg-gray-300' : ''">Szene
    2</button>
  -->

  <select v-model="selected" class="ml-6">
    <option disabled value="Wähle eine Playlist">Wähle eine Playlist</option>
    <option v-for="element in dataStore.playlists" :key="element.name" :value="element">
      {{ element.name }}
    </option>
  </select>

  <button @click="selectPlaylist" class="border border-black m-6">Playlist laden</button>

  <!--<SoundeffectButton :soundeffect="audioPlayerStore.soundeffects[0]" v-if="audioPlayerStore.soundeffects.length > 0">
  </SoundeffectButton>-->
  <MediaControls></MediaControls>
</template>

<script>
//import SoundeffectButton from '@/components/SoundeffectButton.vue';
import MediaControls from '@/components/MediaControls.vue';
import { useAudioPlayerStore } from '@/stores/audioPlayerStore.js'
import { useDataStore } from './stores/dataStore';
import { loadNewPlaylist, loadPlaylist } from './util/fileManager';

export default {
  setup() {
    const audioPlayerStore = useAudioPlayerStore()
    const dataStore = useDataStore()

    return {
      audioPlayerStore,
      dataStore
    }
  },
  data() {
    return {
      selected: undefined
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
    async selectPlaylist() {
      this.audioPlayerStore.setPlaylist(await loadNewPlaylist())
    }
  },
  components: {
    //SoundeffectButton,
    MediaControls
  },
  watch: {
    async selected(newVal) {
      this.audioPlayerStore.setPlaylist(await loadPlaylist(newVal.path))
    }
  }
}
</script>
  