import { defineStore } from 'pinia'
import { exists, readTextFile, writeFile, createDir, BaseDirectory } from "@tauri-apps/api/fs"

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
    configFile() {
      return [this.name.replace(/\s/g, ''), 'preset', 'json'].join('.')
    }
  },
  actions: {
    /**
     * Fügt Playlist dem Preset hinzu.
     * @param {String} playlistName Ein eindeutiger Name für die Playlist
     * @param {String} path Absoluter Path zum Playlist Ordner 
     */
    async addPlaylist(playlistName, path) {
      //Wenn Playlist noch nicht in der Group ist
      if (!this.playlists.some(val => val.name === playlistName)) {
        this.playlists.push({
          name: playlistName,
          path: path
        })
        if (!await exists('.soundboard', { dir: BaseDirectory.Data })) {
          await createDir('.soundboard', { dir: BaseDirectory.Data })
        }

        const content = JSON.parse(await readTextFile(['.soundboard', this.configFile].join('\\'), {dir: BaseDirectory.Data}))

        content.playlists.push({
          name: playlistName,
          path: path
        })

        await writeFile({ path: ['.soundboard', this.configFile].join('\\'), contents: JSON.stringify(content) }, { dir: BaseDirectory.Data })
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
