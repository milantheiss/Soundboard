<template class="font-poppins font-normal text-white">
  <!--
  <button @click="switchPlaylist" class="border border-white m-6" :class="(isSzene1) ? 'bg-gray-300' : ''">Szene
    1</button>
  <button @click="switchPlaylist" class="border border-white m-6" :class="(!isSzene1) ? 'bg-gray-300' : ''">Szene
    2</button>
  -->

  <!--
  <div class="grid grid-cols-4">
    <div class="w-full h-full bg-slate-500 m-4" v-for="sfx in presetStore.soundeffects" :key="sfx.name">
      <button class="
        w-full h-full
        px-4 py-4
        inline-flex justify-center
        bg-electric-blue hover:bg-electric-blue-hover 
        border border-transparent rounded-md shadow-sm
        text-base font-semibold  text-white 
        focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2">{{ sfx.name }}</button>
    </div>
    <div class="w-full h-full bg-slate-500 m-4" v-for="val in emptyList" :key="val"></div>
  </div>
  -->

  <div class="flex justify-start items-center">
    <span class="bg-background-dark-gray">
      <SelectList v-model="_selectedPreset" defaultValue="Wähle ein Preset" :options="presets" class="ml-6 w-64">
      </SelectList>
    </span>
    <button @click="this.$refs.createPresetPrompt.open = true" class="w-fit inline-flex justify-center
        m-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2">Preset erstellen</button>
  </div>

  <!--TODO Neue Playlisten laden/erstellen und zum Preset hinzufügen-->
  <!--TODO Playlisten auswählen-->

  <div class="flex justify-start items-center">
    <span class="bg-background-dark-gray">
      <SelectList v-model="_selectedPlaylist" defaultValue="Wähle ein Playlist" :options="preset.playlists"
        class="ml-6 w-64"></SelectList>
    </span>
    <button @click="addPlaylistToPreset" class="w-fit inline-flex justify-center
        m-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2">Playlist laden</button>
    <!--TODO Button ausgrauen, wenn Player spielt.-->
    <button @click="reloadPlaylist" class="w-fit inline-flex justify-center
        m-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2">Playlist aktualisieren</button>
    <!--<button @click="this.$refs.createPlaylist.open = true" class="border border-white m-6">Neue Playlist erstellen</button>-->
  </div>

  <div class="flex justify-start items-center">
    <p class="text-lg mt-6 mb-0 mx-6" v-if="typeof audioPlayer.current !== 'undefined'">{{ audioPlayer.current.name }}
    </p>
    <p class="text-lg mt-6 mb-0 mx-6" v-if="typeof audioPlayer.current === 'undefined'">Keine Playlist ausgewählt.</p>
    <button @click="$refs.addSongPrompt.open = true" class="w-fit inline-flex justify-center
        m-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2">Song hinzufügen</button>
  </div>


  <!--<SoundeffectButton :soundeffect="audioPlayerStore.soundeffects[0]" v-if="audioPlayerStore.soundeffects.length > 0">
  </SoundeffectButton>-->
  <MediaControls></MediaControls>

  <div class="mx-6 bg-background rounded-lg p-4">
    <p>Current Track Settings</p>
    <div class="flex justify-between items-center mt-4">
      <TextInput v-model="trackSettings.name" class="w-full text-white" placeholder="Songname">
      </TextInput>
    </div>
    <div class="flex justify-between items-center mt-4">
      <p class="text-xl font-semibold text-gray-200">Volume:</p>
      <NumberInput v-model="trackSettings.trackvolume" class="w-32 text-white" :step="0.1" min="0.0" max="1.0">
      </NumberInput>
    </div>
    <div class="flex justify-between items-center mt-4">
      <p class="text-xl font-semibold text-gray-200">Fade In:</p>
      <NumberInput v-model="trackSettings.fadeInDuration" class="w-32 text-white" :step="1" min="0">
      </NumberInput>
    </div>
    <div class="flex justify-between items-center mt-4">
      <p class="text-xl font-semibold text-gray-200">Fade Out:</p>
      <NumberInput v-model="trackSettings.fadeOutDuration" class="w-32 text-white" :step="1" min="0">
      </NumberInput>
    </div>
    <div class="flex justify-between items-center mt-4">
      <p class="text-xl font-semibold text-gray-200">Looping:</p>
      <CheckboxInput v-model="trackSettings.isLooping"></CheckboxInput>
    </div>
    <div class="flex justify-between items-center mt-4">
      <p class="text-xl font-semibold text-gray-200">Playlist Position:</p>
      <NumberInput v-model="trackSettings.pos" class="w-32 text-white" :step="1" min="1"
        :max="(audioPlayer.playlist.tracks.length).toString()">
      </NumberInput>
    </div>
    <div class="flex justify-end items-center mt-4">
      <button type="button"
        class="inline-flex w-full justify-center rounded-md border border-transparent bg-special-red px-4 py-2 text-base font-medium text-black shadow-sm hover:bg-special-red-hover focus:outline-none focus:ring-2 focus:ring-special-red-hover focus:ring-offset-2 ml-5 sm:w-auto sm:text-sm"
        @click="$refs.confirmTrackRemoval.open = true">Entfernen</button>
      <button type="button"
        class="inline-flex w-full justify-center rounded-md border border-transparent bg-electric-blue px-4 py-2 text-base font-medium text-black shadow-sm hover:bg-electric-blue-hover focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 ml-5 sm:w-auto sm:text-sm"
        @click="changeTrackSettings">Speichern</button>
    </div>
  </div>

  <ConfirmationPrompt ref="confirmTrackRemoval" buttonText="Löschen" header="Möchtest du den Track wirklich löschen?"
    text="Die Datei wird aus dem Playlist Ordner gelöscht." @onConfirm="audioPlayer.removeTrack(audioPlayer.current)">
  </ConfirmationPrompt>
  <PromptDialog ref="createPresetPrompt" @onCommit="(name) => createPreset(name)"
    header="Wie soll das neue Preset heißen?" text="* Der Name muss einzigartig sein."></PromptDialog>
  <NewTrackPrompt ref="addSongPrompt" @onCommit="(song) => audioPlayer.addSong(song)"></NewTrackPrompt>
  <!--<PromptDialog ref="createPlaylist" @onCommit="(name) => createPlaylist(name)" header="Wie soll die neue Playlist heißen?" text="*Der Name muss einzigartig sein."></PromptDialog>-->
</template>

<script>
//import SoundeffectButton from '@/components/SoundeffectButton.vue';
import MediaControls from '@/components/MediaControls.vue';
import SelectList from '@/components/SelectList.vue';
import { useAudioPlayerStore } from '@/stores/audioPlayerStore.js'
import PromptDialog from './components/PromptDialog.vue';
import ConfirmationPrompt from './components/ConfirmationPrompt.vue';
import NewTrackPrompt from './components/NewTrackPrompt.vue'
import { usePresetStore } from './stores/presetStore';
import { loadNewPlaylist, loadAllPresets } from './util/fileManager';
import TextInput from './components/TextInput.vue';
import NumberInput from './components/NumberInput.vue';
import CheckboxInput from './components/CheckboxInput.vue';

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
      presets: [],
      trackSettings: {
        name: undefined,
        trackvolume: undefined,
        fadeInDuration: undefined,
        fadeOutDuration: undefined,
        isLooping: undefined,
        pos: undefined
      }
    }
  },
  methods: {
    async createPreset(presetName) {
      await this.preset.createNewPreset(presetName)
      this.presets = await loadAllPresets()
    },
    async addPlaylistToPreset() {
      if (this.preset.name.length > 0) {
        this.preset.addPlaylist(await loadNewPlaylist())
      } else {
        console.error('Kein Preset gesetzt')
      }
    },

    /**
     * Lädt ausgewählte Playlist neu
     */
    async reloadPlaylist() {
      if (typeof this.audioPlayer.playlist.name !== 'undefined') {
        if (!this.audioPlayer.isPlaying) {
          this.audioPlayer.setPlaylist(this._selectedPlaylist.path)
        } else {
          //TODO UI Error zeigen
          console.error('Playlist kann nur aktualisiert werden, wenn Player pausiert ist.')
        }
      }
    },

    changeTrackSettings(){
      this.trackSettings.pos--
      this.audioPlayer.changeTrackSettings(this.audioPlayer.current, this.trackSettings)
      this.trackSettings.pos++
    }
  },
  components: {
    //SoundeffectButton,
    MediaControls,
    PromptDialog,
    SelectList,
    NewTrackPrompt,
    TextInput,
    NumberInput,
    CheckboxInput,
    ConfirmationPrompt
  },
  watch: {
    'audioPlayer.current'() {
      if (typeof this.audioPlayer.current !== 'undefined') {
        this.trackSettings.name = this.audioPlayer.current.name
        this.trackSettings.trackvolume = this.audioPlayer.current.trackvolume
        this.trackSettings.fadeInDuration = this.audioPlayer.current.fadeInDuration
        this.trackSettings.fadeOutDuration = this.audioPlayer.current.fadeOutDuration
        this.trackSettings.isLooping = this.audioPlayer.current.isLooping
        this.trackSettings.pos = this.audioPlayer.current.pos + 1
      }
    },
    'audioPlayer.current.isLooping'() {
      if (typeof this.audioPlayer.current !== 'undefined') {
        this.trackSettings.isLooping = this.audioPlayer.current.isLooping
      }
    },
    async _selectedPreset(newVal) {
      if (!await this.preset.setPreset(newVal.filename)) {
        this.presets = await loadAllPresets()
      }
    },
    async _selectedPlaylist(newVal) {
      this.audioPlayer.setPlaylist(newVal.path)
    }
  },
  async created() {
    this.presets = await loadAllPresets()
  }
}
</script>
  