<template class="font-poppins font-normal">
  <!--
  <button @click="switchPlaylist" class="border border-black m-6" :class="(isSzene1) ? 'bg-gray-300' : ''">Szene
    1</button>
  <button @click="switchPlaylist" class="border border-black m-6" :class="(!isSzene1) ? 'bg-gray-300' : ''">Szene
    2</button>
  -->

  <div class="flex justify-start items-center">
    <p class="text-lg mt-6 mb-0 mx-6" v-if="typeof audioPlayer.current !== 'undefined'">{{ audioPlayer.current.name }}
    </p>
    <p class="text-lg mt-6 mb-0 mx-6" v-if="typeof audioPlayer.current === 'undefined'">Keine Playlist ausgewählt.</p>
    
  </div>

  <!--
  <div class="grid grid-cols-4">
    <div class="w-full h-full bg-slate-500 m-4" v-for="sfx in presetStore.soundeffects" :key="sfx.name">
      <button class="
        w-full h-full
        px-4 py-4
        inline-flex justify-center
        bg-electric-blue hover:bg-electric-blue-hover 
        border border-transparent rounded-md shadow-sm
        text-base font-semibold  text-black 
        focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2">{{ sfx.name }}</button>
    </div>
    <div class="w-full h-full bg-slate-500 m-4" v-for="val in emptyList" :key="val"></div>
  </div>
  -->

  <div class="flex justify-start items-center">
    <SelectList v-model="_selectedPreset" defaultValue="Wähle ein Preset" :options="presets" class="ml-6 w-64"></SelectList>
    <button @click="this.$refs.createPreset.open = true" class="border border-black m-6">Preset erstellen</button>
  </div>

  <!--TODO Neue Playlisten laden/erstellen und zum Preset hinzufügen-->
  <!--TODO Playlisten auswählen-->

  <div class="flex justify-start items-center">
    <SelectList v-model="_selectedPlaylist" defaultValue="Wähle ein Playlist" :options="preset.playlists" class="ml-6 w-64"></SelectList>
    <button @click="addPlaylistToPreset" class="border border-black m-6">Playlist laden</button>
    <!--<button @click="this.$refs.createPlaylist.open = true" class="border border-black m-6">Neue Playlist erstellen</button>-->
  </div>

  <!--<SoundeffectButton :soundeffect="audioPlayerStore.soundeffects[0]" v-if="audioPlayerStore.soundeffects.length > 0">
  </SoundeffectButton>-->
  <MediaControls></MediaControls>
  <PromptDialog ref="createPreset" @onCommit="(name) => createPreset(name)" header="Wie soll das neue Preset heißen?" text="*Der Name muss einzigartig sein."></PromptDialog>
  <!--<PromptDialog ref="createPlaylist" @onCommit="(name) => createPlaylist(name)" header="Wie soll die neue Playlist heißen?" text="*Der Name muss einzigartig sein."></PromptDialog>-->
</template>

<script>
//import SoundeffectButton from '@/components/SoundeffectButton.vue';
import MediaControls from '@/components/MediaControls.vue';
import SelectList from '@/components/SelectList.vue';
import { useAudioPlayerStore } from '@/stores/audioPlayerStore.js'
import PromptDialog from './components/PromptDialog.vue';
import { usePresetStore } from './stores/presetStore';
import { loadNewPlaylist, loadAllPresets } from './util/fileManager';

export default {
  setup() {
    const audioPlayer = useAudioPlayerStore()
    const preset = usePresetStore()

    return {
      audioPlayer,
      preset
    }
  },
  data() {
    return {
      // eslint-disable-next-line vue/no-reserved-keys
      _selectedPreset: undefined,
      // eslint-disable-next-line vue/no-reserved-keys
      _selectedPlaylist: undefined,
      presets: []
    }
  },
  methods: {
    switchPlaylist() {
      if (this.isSzene1) {
        this.audioPlayer.setPlaylist(this.playlist2)
        this.isSzene1 = false
      } else {
        this.audioPlayer.setPlaylist(this.playlist1)
        this.isSzene1 = true
      }
    },
    async createPreset(presetName) {
      console.log(await this.preset.createNewPreset(presetName));
      this.presets = await loadAllPresets()
    },
    async addPlaylistToPreset(){
      if(this.preset.name.length > 0){
        this.preset.addPlaylist(await loadNewPlaylist())
        console.log(this.preset.playlists);
      } else {
        console.error('Kein Preset gesetzt')
      }
    }
  },
  components: {
    //SoundeffectButton,
    MediaControls,
    PromptDialog,
    SelectList
  },
  watch: {
    async _selectedPreset(newVal) {
      console.log(newVal);
      this.preset.setPreset(newVal.filename)
      //this.audioPlayerStore.setPlaylist(await loadPlaylist(newVal.path))
    },
    async _selectedPlaylist(newVal) {
      console.log(newVal);
      this.audioPlayer.setPlaylist(newVal.path)
      //this.audioPlayerStore.setPlaylist(await loadPlaylist(newVal.path))
    }
  },
  async created() {
    this.presets = await loadAllPresets()
  }
}
</script>
  