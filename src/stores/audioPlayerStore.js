import { defineStore } from 'pinia'

export const useAudioPlayerStore = defineStore('audioPlayerStore', {
  state: () => ({
    //Muss Tracks definiert haben, damit keine Fehler geworfen werden --> Auf .tracks wird zugegriffen
    playlist: {
      tracks: []
    },
    currentIndex: 0,
    oldIndex: undefined
  }),
  getters: {
    next() {
      if (this.currentIndex + 1 > this.playlist.tracks.length - 1) {
        return this.playlist.tracks[0]
      } else {
        return this.playlist.tracks[this.currentIndex + 1]
      }
    },
    previous() {
      if (this.currentIndex - 1 < 0) {
        return this.playlist.tracks[this.playlist.tracks.length - 1]
      } else {
        return this.playlist.tracks[this.currentIndex - 1]
      }
    },
    current() {
      return this.playlist.tracks[this.currentIndex]
    },
    isPlaying() {
      if (typeof this.current !== 'undefined' && typeof this.current.player !== 'undefined') {
        return this.current.player.playing()
      } else {
        return false
      }
    },
    isLooping() {
      if (typeof this.current !== 'undefined' && typeof this.current.player !== 'undefined') {
        return this.current.isLooping
      } else {
        return false
      }
    },
  },
  actions: {
    advanceToNextIndex() {
      this.oldIndex = this.currentIndex
      //Erhöht Index
      if (this.currentIndex + 1 > this.playlist.tracks.length - 1) {
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
      }
    },
    advanceToPreviousIndex() {
      this.oldIndex = this.currentIndex

      //Verringert Index
      this.currentIndex++;
      if (this.currentIndex < 0) {
        this.currentIndex = this.playlist.tracks.length - 1;
      }
    },
    setPlaylist(playlist) {
      //FIXME Playlist wird nicht an State übergeben
      this.oldIndex = this.currentIndex
      this.playlist = playlist
      this.currentIndex = 0
    }
  },

})
