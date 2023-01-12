<template class="font-poppins font-normal text-white p-6">
  <!--Anwendungstitel-->
  <!--<p class="text-3xl font-semibold col-span-2 italic ml-6 mt-6">Stagebard</p>-->

  <!--Preset & Playlist Selector-->
  <div class="grid grid-cols-2 gap-4 items-center mx-6 mt-6">
    <div class="flex justify-between items-center">
      <span class="bg-background-dark-gray">
        <SelectList v-model="_selectedPreset" defaultValue="Wähle ein Preset" :options="presets" class="w-64">
        </SelectList>
      </span>
      <button @click="this.$refs.createPresetPrompt.open = true" class="w-fit h-fit inline-flex justify-center
        ml-6 px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2">Create Preset</button>
    </div>

    <div class="flex justify-between items-center">
      <span class="bg-background-dark-gray">
        <SelectList ref="selectPlaylist" v-model="_selectedPlaylist" defaultValue="Wähle ein Playlist"
          :options="preset.playlists" class="w-64"></SelectList>
      </span>
      <button @click="addPlaylistToPreset" class="w-40 h-fit inline-flex justify-center
        ml-6 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2">Add Playlist</button>
      <!--TODO Button ausgrauen, wenn Player spielt.-->
    </div>
  </div>


  <div class="grid grid-cols-2 gap-4 m-6">
    <!--Tracksettings Card-->
    <div class="bg-background rounded-lg p-4 drop-shadow-md w-full">
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
        <p class="ml-3 font-semibold text-xl truncate" v-if="typeof audioPlayer.current !== 'undefined'">Track Settings
          • {{
            audioPlayer.current.name
          }}</p>
        <p class="ml-3 font-semibold text-xl" v-if="typeof audioPlayer.current === 'undefined'">Track Settings</p>
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

    <!--Playlist Card-->
    <div class="bg-background rounded-lg p-4 drop-shadow-md row-span-2 w-full h-full">
      <span class="flex justify-start items-center">
        <p class="font-semibold text-xl" v-if="(typeof audioPlayer.playlist.name !== 'undefined')">
          {{ audioPlayer.playlist.name }}</p>
        <p class="font-semibold text-xl" v-if="(typeof audioPlayer.playlist.name === 'undefined')">Keine Playlist
          ausgewählt</p>
        <!--Refresh Icon-->
        <span @click="reloadPlaylist" :class="reloadSpin ? 'animate-reloadSpin' : ''" @animationend="reloadSpin = false"
          class="w-7 h-7 ml-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </span>
      </span>
      <div>
      </div>
      <button @click="$refs.addSongPrompt.open = true" class="w-fit inline-flex justify-center
        px-3 py-2 
        border border-transparent bg-electric-blue rounded-md shadow-sm
        text-base font-medium text-black 
        hover:bg-electric-blue-hover focus:outline-none focus:ring-2 
        focus:ring-electric-blue-hover focus:ring-offset-2">Song hinzufügen</button>
    </div>

    <!--Media Controls Card-->
    <div class="grid grid-cols-3 gap-x-2 items-center bg-background rounded-lg p-4 drop-shadow-md h-fit w-full">
      <span class="w-full text-2xl font-semibold col-span-2">
        <p   v-if="typeof audioPlayer.current !== 'undefined'" class="truncate">{{
          audioPlayer.current.pos + 1
        }}: <span class="italic"> {{ audioPlayer.current.name }} </span></p>
        <p v-if="typeof audioPlayer.current === 'undefined'">Kein Song geladen.</p>
        <!--TODO Seek Bar hinzufügen-->
      </span>
      <MediaControls ref="mediaControls" class="w-full"></MediaControls>
    </div>

    <!--Devtools Card-->
    <div class="bg-developer-yellow-backgroud p-4 rounded-lg col-span-2 w-full flex justify-between items-center"
      :class="$refs.mediaControls?.useHotkeys ? 'bg-lime-500 bg-opacity-10' : ''">
      <button @click="resetSong" class="
          w-fit
          mr-4 px-3 py-2 
          border border-transparent  rounded-md shadow-sm
          text-base font-medium text-black 
          focus:outline-none focus:ring-2 
           focus:ring-offset-2"
        :class="$refs.mediaControls?.useHotkeys ? 'bg-lime-500 hover:bg-lime-700 focus:ring-lime-400' : 'bg-developer-yellow hover:bg-yellow-700 focus:ring-developer-yellow'">Reset
        Song</button>
      <button @click="reloadPlaylist" class="
          w-fit
          mr-4 px-3 py-2 
          border border-transparent  rounded-md shadow-sm
          text-base font-medium text-black 
          focus:outline-none focus:ring-2 
           focus:ring-offset-2"
        :class="$refs.mediaControls?.useHotkeys ? 'bg-lime-500 hover:bg-lime-700 focus:ring-lime-400' : 'bg-developer-yellow hover:bg-yellow-700 focus:ring-developer-yellow'">Playlist
        aktualisieren</button>
      <button @click="toggleHotkeys" class="
          w-fit
          mr-4 px-3 py-2 
          border border-transparent  rounded-md shadow-sm
          text-base font-medium text-black 
          focus:outline-none focus:ring-2 
           focus:ring-offset-2"
        :class="$refs.mediaControls?.useHotkeys ? 'bg-lime-500 hover:bg-lime-700 focus:ring-lime-400' : 'bg-electric-blue hover:bg-electric-blue-hover focus:ring-electric-blue'">Hotkeys
        toggeln</button>
      <button @click="nextPlaylist" class="
          w-fit
          mr-4 px-3 py-2 
          border border-transparent  rounded-md shadow-sm
          text-base font-medium text-black 
          focus:outline-none focus:ring-2 
           focus:ring-offset-2"
        :class="$refs.mediaControls?.useHotkeys ? 'bg-lime-500 hover:bg-lime-700 focus:ring-lime-400' : 'bg-developer-yellow hover:bg-yellow-700 focus:ring-developer-yellow'">Nächste
        Playlist</button>
    </div>
  </div>


  <!--Collapse Icon
      <span class="flex justify-start items-center" @click="showDeveloperTools = !showDeveloperTools">
        <span v-show="!showDeveloperTools" class="text-developer-yellow flex items-center"
          :class="$refs.mediaControls.useHotkeys ? 'text-lime-500' : ''">
          <!-Show More Icon->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>

        </span>
        <span v-show="showDeveloperTools" class="text-developer-yellow flex items-center"
          :class="$refs.mediaControls.useHotkeys ? 'text-lime-500' : ''">
          <!-Show Less Icon->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </span>
      </span>
  -->

  <ErrorPrompt ref="playerError"></ErrorPrompt>
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
import { register, unregisterAll } from '@tauri-apps/api/globalShortcut';
import ErrorPrompt from './components/ErrorPrompt.vue';

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
      showTrackSettings: true,
      reloadSpin: false
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
          this.reloadSpin = true
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
    },

    async toggleHotkeys() {
      await this.$refs.mediaControls.toggleHotkeys()
      if (this.$refs.mediaControls.useHotkeys) {
        await register('V', () => {
          if (Date.now() - this.$refs.mediaControls.lastHotkey > this.$refs.mediaControls.cooldown || !this.$refs.mediaControls.hotkeyHasCooldown) {
            this.nextPlaylist()
            this.$refs.mediaControls.lastHotkey = Date.now()
          }
        });
      } else {
        await unregisterAll()
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
    ConfirmationPrompt,
    ErrorPrompt
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
    'audioPlayer.current.player'() {
      if (typeof this.audioPlayer.current.player !== 'undefined') {
        this.audioPlayer.current.player.on('loaderror', (id, e) => {
          if (e === 'Failed loading audio file with status: 404.') {
            this.$refs.playerError.text = '404: Audio Datei konnte nicht im Playlisten Ordner gefunden werden.'
          } else {
            this.$refs.playerError.text = 'Unbekannter Fehler beim Laden Audiodatei'
          }
          this.$refs.playerError.open = true
        })
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
