<template class="font-poppins font-normal text-white p-6">
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


  <p class="text-3xl font-semibold col-span-2 italic ml-6 mt-6">Stagebard</p>

  <div class="flex justify-between items-center mx-6 mt-6">
    <div class="flex justify-start items-center">
      <span class="bg-background-dark-gray">
        <SelectList v-model="_selectedPreset" defaultValue="Wähle ein Preset" :options="presets" class="w-64">
        </SelectList>
      </span>
      <button @click="this.$refs.createPresetPrompt.open = true" class="w-full h-fit inline-flex justify-center
          ml-6 px-3 py-2 
          border border-transparent bg-electric-blue rounded-md shadow-sm
          text-base font-medium text-black 
          hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
          focus:ring-electric-blue-hover focus:ring-offset-2">Preset erstellen</button>
    </div>

    <div class="flex justify-start items-center">
      <span class="bg-background-dark-gray">
        <SelectList ref="selectPlaylist" v-model="_selectedPlaylist" defaultValue="Wähle ein Playlist"
          :options="preset.playlists" class="w-64"></SelectList>
      </span>
      <button @click="addPlaylistToPreset" class="w-full inline-flex justify-center
          ml-6 px-3 py-2 
          border border-transparent bg-electric-blue rounded-md shadow-sm
          text-base font-medium text-black 
          hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
          focus:ring-electric-blue-hover focus:ring-offset-2">Playlist laden</button>
      <!--TODO Button ausgrauen, wenn Player spielt.-->

      <!--<button @click="this.$refs.createPlaylist.open = true" class="border border-white m-6">Neue Playlist erstellen</button>-->
    </div>
  </div>


  <!--TODO Neue Playlisten laden/erstellen und zum Preset hinzufügen-->
  <!--TODO Playlisten auswählen-->

  <div>
    <div class="bg-developer-yellow-backgroud p-4 mx-6 mt-6 mb-3 rounded-lg">
      <span class="flex justify-start items-center" @click="showDeveloperTools = !showDeveloperTools">
        <span v-show="!showDeveloperTools" class="text-developer-yellow flex items-center">
          <!--Show More Icon-->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>

        </span>
        <span v-show="showDeveloperTools" class="text-developer-yellow flex items-center">
          <!--Show Less Icon-->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </span>
        <p class="font-semibold text-xl ml-4 text-developer-yellow">Developer Tools</p>
      </span>
      <div v-show="showDeveloperTools" class="flex justify-between items-center mt-3">
        <button @click="resetSong" class="
          w-fit
          mr-4 px-3 py-2 
          border border-transparent bg-developer-yellow rounded-md shadow-sm
          text-base font-medium text-black 
          hover:bg-yellow-700 focus:outline-none focus:ring-2 
          focus:ring-developer-yellow focus:ring-offset-2">Song Reset</button>
        <button @click="reloadPlaylist" class="
          w-fit
          mr-4 px-3 py-2 
          border border-transparent bg-developer-yellow rounded-md shadow-sm
          text-base font-medium text-black 
          hover:bg-yellow-700 focus:outline-none focus:ring-2 
          focus:ring-developer-yellow focus:ring-offset-2">Playlist
          aktualisieren</button>
        <div v-if="typeof $refs.mediaControls !== 'undefined'">
          <button @click="$refs.mediaControls.toggleHotkeys" class="
          w-fit
          mr-4 px-3 py-2 
          border border-transparent bg-developer-yellow rounded-md shadow-sm
          text-base font-medium text-black 
          hover:bg-yellow-700 focus:outline-none focus:ring-2 
          focus:ring-developer-yellow focus:ring-offset-2"
            :class="$refs.mediaControls.useHotkeys ? 'bg-lime-500 hover:bg-lime-700 focus:ring-lime-400' : ''">Hotkeys
            toggeln</button>
        </div>
        <button @click="nextPlaylist" class="
          w-fit
          mr-4 px-3 py-2 
          border border-transparent bg-developer-yellow rounded-md shadow-sm
          text-base font-medium text-black 
          hover:bg-yellow-700 focus:outline-none focus:ring-2 
          focus:ring-developer-yellow focus:ring-offset-2">Nächste Playlist</button>
      </div>
    </div>
  </div>

  <div class="grid place-item-center grid-cols-3 items-center mx-6 bg-background rounded-lg p-4 drop-shadow-md">
    <p class="text-2xl font-semibold col-span-2" v-if="typeof audioPlayer.current !== 'undefined'">{{
        audioPlayer.current.pos + 1
    }}: <span class="italic"> {{ audioPlayer.current.name }} </span></p>
    <p class="text-2xl font-semibold" v-if="typeof audioPlayer.current === 'undefined'">Kein Song geladen.</p>
    <MediaControls ref="mediaControls"></MediaControls>
  </div>
  <div>
    <button @click="$refs.addSongPrompt.open = true" class="w-fit inline-flex justify-center
        m-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2">Song hinzufügen</button>
  </div>


  <!--<SoundeffectButton :soundeffect="audioPlayerStore.soundeffects[0]" v-if="audioPlayerStore.soundeffects.length > 0">
  </SoundeffectButton>-->


  <div class="mx-6 bg-background rounded-lg p-4 drop-shadow-md">
    <span class="flex justify-start items-center" @click="showTrackSettings = !showTrackSettings">
      <span v-show="!showTrackSettings" class="text-white flex items-center">
        <!--Show More Icon-->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-7 h-7">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>

      </span>
      <span v-show="showTrackSettings" class="text-white flex items-center">
        <!--Show Less Icon-->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-7 h-7">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>

      </span>
      <p class="ml-4 font-semibold text-xl" v-if="typeof audioPlayer.current !== 'undefined'">Track Einstellungen • {{
          audioPlayer.current.name
      }}</p>
      <p class="ml-4 font-semibold text-xl" v-if="typeof audioPlayer.current === 'undefined'">Track Einstellungen</p>
    </span>
    <div v-show="showTrackSettings">
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
  </div>

  <ConfirmationPrompt ref="confirmTrackRemoval" buttonText="Löschen" header="Möchtest du den Track wirklich löschen?"
    :text="'Die Datei wird nicht aus dem Playlist Ordner gelöscht. \nJedoch gehen die Track Einstellungen verloren.'"
    @onConfirm="audioPlayer.removeTrack(audioPlayer.current)">
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
      },
      showDeveloperTools: false,
      showTrackSettings: true
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

    changeTrackSettings() {
      this.trackSettings.pos--
      this.audioPlayer.changeTrackSettings(this.audioPlayer.current, this.trackSettings)
      this.trackSettings.pos++
    },

    /**
     * Devtool: Go to next Playlist
     */
    nextPlaylist() {
      console.log('Go to next Playlist')
      const temp = this.preset.nextPlaylist()
      console.log(temp);
      if (typeof temp !== 'undefined') {
        this.$refs.selectPlaylist.selected = temp
        this._selectedPlaylist = temp
      } else {
        console.error('App: Could not go to next Playlist (Return was undefined)')
      }
    },

    resetSong() {
      if (typeof this.audioPlayer.current !== 'undefined') {
        if (typeof this.audioPlayer.current.player !== 'undefined') {
          this.audioPlayer.current.player.load()
          this.audioPlayer.current.player.seek(0.0)
          this.audioPlayer.current.player.volume(this.audioPlayer.current.trackvolume)
          this.audioPlayer.current.player.loop(this.audioPlayer.current.isLooping)
        }
      }
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
  