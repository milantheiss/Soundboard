import { defineStore } from 'pinia'
import { loadPlaylist } from '../util/fileManager'
import { exists, copyFile, writeFile, removeFile } from "@tauri-apps/api/fs"

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
    path() {
      let _path = this.playlist.path
      if (typeof _path !== 'undefined') {
        if (_path.startsWith('https://asset.localhost/')) {
          _path = _path.slice(24).replaceAll('%3A', ':').replaceAll('%5C', '\\').replaceAll('%20', ' ')
        }
        return _path
      } else {
        return undefined
      }
    }
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
      if (this.currentIndex - 1 < 0) {
        this.currentIndex = this.playlist.tracks.length - 1;
      } else {
        this.currentIndex--
      }
    },

    /**
     * Lädt ein Playlist
     * @param {String} path Absoluter Path zur Playlist Ordner
     */
    async setPlaylist(path) {
      this.oldIndex = this.currentIndex
      this.currentIndex = 0
      if (typeof path !== 'undefined') {
        this.playlist = await loadPlaylist(path)
      } else {
        this.playlist = {
          tracks: []
        }
      }
    },

    /**
     * Fügt neuen Song in Playlist hinzu
     * @param {Object} Song Settings 
     */
    async addSong(song) {
      if (!this.playlist.tracks.some(val => val.name === song.settings.name)) {
        if (!await exists([this.path, song.settings.filename].join('\\'))) {
          await copyFile(song.origin, [this.path, song.settings.filename].join('\\'))
          //File in Playlist Ordner kopieren.
          //File in Playlist Config schreiben.
        }

        console.log(this.playlist.tracks);
        this.playlist.tracks.splice(song.settings.pos, 0, song.settings)
        this._triggerPosUpdate()
        console.log(this.playlist.tracks);

        this.writeToConfig(this.playlist)
      }
    },

    _triggerPosUpdate() {
      this.playlist.tracks.forEach(element => element.pos = this.playlist.tracks.indexOf(element))
    },

    _sortTracks(playlist) {
      let temp = []
      let tail = []
      playlist.tracks.forEach(element => {
        if (typeof temp[element.pos] === 'undefined') {
          temp[element.pos] = element
        } else {
          tail.push(element)
        }
      });

      temp = temp.concat(tail)

      if (tail.length > 0) {
        tail.forEach(element => {
          temp[temp.indexOf(element)].pos = temp.indexOf(element)
        })
      }

      playlist.tracks = temp

      return playlist
    },

    /**
     * Ändert Tracksettings
     * @param {Object} Abgeänderte Tracksettings --> Trackvolume, Fade In/Out Duration, isLooping
     */
    async changeTrackSettings(track, settings) {
      if (typeof track !== 'undefined') {
        track.name = settings.name
        track.trackvolume = settings.trackvolume
        track.fadeInDuration = settings.fadeInDuration
        track.fadeOutDuration = settings.fadeOutDuration
        track.isLooping = settings.isLooping
        if (typeof track.player !== 'undefined') {
          track.player.volume(track.trackvolume)
          track.player.loop(track.isLooping)
        }
        if (track.pos !== settings.pos) {
          if (this.currentIndex <= settings.pos) {
            //FIXME
            if (this.currentIndex > track.pos) {
              this.advanceToPreviousIndex()
            } else if (this.currentIndex === settings.pos) {
              this.advanceToNextIndex()
            } else if (this.currentIndex === track.pos) {
              this.currentIndex = settings.pos
            }
          } else {
            if (this.currentIndex > track.pos) {
              this.advanceNextIndex()
            } else if (this.currentIndex === track.pos) {
              this.currentIndex = settings.pos
            }
          }
          this.playlist.tracks.splice(track.pos, 1)
          this.playlist.tracks.splice(settings.pos, 0, track)
          track.pos = settings.pos
          this._triggerPosUpdate()
        }
        this._triggerPosUpdate()
        this.playlist = this._sortTracks(this.playlist)
      }

      this.writeToConfig(this.playlist)
    },

    /**
     * Entfernt ein Track aus der Playlist
     */
    async removeTrack(track) {
      if (typeof track !== 'undefined') {
        this.advanceToNextIndex()
        this.playlist.tracks.splice(this.playlist.tracks.indexOf(track), 1)
        this.writeToConfig(this.playlist)
        await removeFile([this.path, track.filename].join('\\'))
      }
    },

    /**
     * Überschreibt playlist.config.json
     * @param {Object} Komplette Playlist Config 
     */
    async writeToConfig(content) {
      const temp = {
        name: content.name,
        tracks: []
      }

      const objMask = ({ name, filename, trackvolume, fadeInDuration, fadeOutDuration, isLooping, pos }) => ({ name, filename, trackvolume, fadeInDuration, fadeOutDuration, isLooping, pos })

      content.tracks.forEach(track => temp.tracks.push(objMask(track)))

      await writeFile({ path: [this.path, '.soundboard', 'playlist.config.json'].join('\\'), contents: JSON.stringify(temp) })
    }
  }
})
