import { defineStore } from 'pinia'
import { exists, readTextFile, writeFile, createDir, BaseDirectory } from "@tauri-apps/api/fs"
import { loadPreset, loadAllPresets } from '../util/fileManager'

export const usePresetStore = defineStore('presetStore', {
  state: () => ({
    //Name des Presets
    name: "",
    //Filename der Preset Config Datei
    filename: '',
    //Enthält den Namen der Playlist & Location der playlist.config.json
    playlists: [],
    //Enthält die Location der playlist.config.json
    soundeffects: []
  }),
  getters: {
  },
  actions: {
    /**
     * Setzt ein neues Preset im Preset Store
     * @param {String} Filename der Preset Config Datei
     */
    async setPreset(filename) {
      const temp = await loadPreset(filename)
      this.name = temp.name
      this.filename = filename
      this.playlists = temp.playlists
      this.soundeffects = temp.soundeffects
    },


    /**
     * Generiert Filename vom Preset Name im Format name.preset.json
     * @returns {String} Generierter Filename im Format name.preset.json
     */
    getFilename(name = this.name) {
      return [name.replace(/\s/g, ''), 'preset', 'json'].join('.')
    },

    /**
     * Erstellt ein neues Preset und fügt ein gegebenes Preset der presets.config.json Datei in AppData hinzu. 
     * Wenn noch keine Config Datei existiert, wir hier eine neue erstellt.
     * @param {String} presetName Eindeutiger Name für das Preset
     * @returns {Boolean} Success
     */
    async createNewPreset(presetName) {

      let content = await loadAllPresets()

      if (!await exists('.soundboard', { dir: BaseDirectory.Data })) {
        await createDir('.soundboard', { dir: BaseDirectory.Data, recursive: true });
      }

      if (typeof content !== 'undefined' && content !== null) {
        if (!content.some(val => val.name === presetName)) {
          console.log("Writing to Preset");
          content.push({ name: presetName, filename: this.getFilename(presetName) })
          await writeFile({ path: '.soundboard\\presets.config.json', contents: JSON.stringify(content) }, { dir: BaseDirectory.Data })

          const _presetData = {
            name: presetName,
            filename: this.getFilename(presetName),
            playlists: [],
            soundeffects: []
          }

          console.log(['.soundboard', this.getFilename(presetName)].join('\\'));

          await writeFile({ path: ['.soundboard', this.getFilename(presetName)].join('\\'), contents: JSON.stringify(_presetData) }, { dir: BaseDirectory.Data })
          this.setPreset(this.getFilename(presetName))
          return true
        }
      }

      return false
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

        const content = JSON.parse(await readTextFile(['.soundboard', this.filename].join('\\'), { dir: BaseDirectory.Data }))

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
