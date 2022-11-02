import { defineStore } from 'pinia'
import { exists, readTextFile, writeFile, createDir, BaseDirectory } from "@tauri-apps/api/fs"
import { addPreset } from '../util/fileManager'

export const usePresetStore = defineStore('presetStore', {
  state: () => ({
    //Name des Presets
    name: "",
    //Enthält den Namen der Playlist & Location der playlist.config.json
    playlists: [],
    //Enthält die Location der playlist.config.json
    soundeffects: []
  }),
  getters: {
    filename() {
      return [this.name.replace(/\s/g, ''), 'preset', 'json'].join('.')
    }
  },
  actions: {
    /**
     * Erstellt ein neues Preset. 
     * @param {String} presetName Eindeutiger Name für das Preset
     * @returns {Boolean} Success
     */
    async createNewPreset(presetName){
      return addPreset(presetName)
    },

    /**
     * Fügt Playlist dem Preset hinzu.
     * @param {String} playlistName Ein eindeutiger Name für die Playlist
     * @param {String} path Absoluter Path zum Playlist Ordner 
     */
    async addPlaylist(playlist) {
      //Wenn Playlist noch nicht in der Group ist
      if (!this.playlists.some(val => val.name === playlist.name)) {
        this.playlists.push({
          name: playlist.name,
          path: playlist.path
        })
        if (!await exists('.soundboard', { dir: BaseDirectory.Data })) {
          await createDir('.soundboard', { dir: BaseDirectory.Data })
        }

        const content = JSON.parse(await readTextFile(['.soundboard', this.filename].join('\\'), {dir: BaseDirectory.Data}))

        content.playlists.push({
          name: playlist.name,
          path: playlist.path
        })

        await writeFile({ path: ['.soundboard', this.filename].join('\\'), contents: JSON.stringify(content) }, { dir: BaseDirectory.Data })
      }
    },
    /**
     * Entfernt Playlist aus dem Preset
     * @param {String} playlistName Der eindeutige Name der Playlist
     */
    removePlaylist(playlistName) {
      const element = this.playlists.find(val => val.name === playlistName)
      this.playlists.splice(this.playlists.indexOf(element), 1)
      //TODO Playlisten werden noch nicht aus File entfernt
    }
  },

})
