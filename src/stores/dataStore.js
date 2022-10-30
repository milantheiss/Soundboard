import { defineStore } from 'pinia'

export const useDataStore = defineStore('dataStore', {
  state: () => ({
    //Enthält die Location der playlist.config.json
    playlists: [],
    //Enthält die Location der playlist.config.json
    soundeffects: [],
    currentIndex: 0,
    oldIndex: undefined
  }),
  getters: {
    
  },
  actions: {
    /**
     * Fügt eine gegebene Playlist der geladenen Liste hinzu.
     * @param {String} playlistName Ein eindeutiger Name für die Playlist
     * @param {String} path Absoluter Path zum Playlist Ordner 
     */
    addPlaylist(playlistName, path) {
      if(!this.playlists.some(val => val.name === playlistName)){
        this.playlists.push({
          name: playlistName,
          path: path
        })
      }
    },
    removePlaylist(playlistName) {
      const element = this.playlists.find(val => val.name === playlistName)
      this.playlists.splice(this.playlists.indexOf(element), 1)
    }
  },

})
