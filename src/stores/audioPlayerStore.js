import { Howl } from "howler"
import { defineStore } from 'pinia'
import { loadPlaylist } from '../util/fileManager'
import { exists, copyFile, writeFile } from "@tauri-apps/api/fs"

export const useAudioPlayerStore = defineStore('audioPlayerStore', {
  state: () => ({
    //Muss Tracks definiert haben, damit keine Fehler geworfen werden --> Auf .tracks wird zugegriffen
    playlist: {
      tracks: []
    },
    currentIndex: 0,
    oldIndex: undefined,
    resetSong: false
  }),
  getters: {
    next() {
      if (this.playlist.tracks.length > 0) {
        if (this.currentIndex + 1 > this.playlist.tracks.length - 1) {
          return this.playlist.tracks[0]
        } else {
          return this.playlist.tracks[this.currentIndex + 1]
        }
      } else {
        return undefined
      }
    },
    previous() {
      if (this.playlist.tracks.length > 0) {
        if (this.currentIndex - 1 < 0) {
          return this.playlist.tracks[this.playlist.tracks.length - 1]
        } else {
          return this.playlist.tracks[this.currentIndex - 1]
        }
      } else {
        return undefined
      }
    },
    current() {
      if (this.playlist.tracks.length > 0) {
        return this.playlist.tracks[this.currentIndex]
      } else {
        return undefined
      }
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
          _path = _path.slice(24)
          _path = decodeURI(_path).replaceAll('%3A', ':')
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

      const getIndexForwardsBuffer = () => {
        if (this.currentIndex + 2 > this.playlist.tracks.length - 1) {
          return (this.currentIndex + 2) - this.playlist.tracks.length;
        } else {
          return this.currentIndex + 2;
        }
      }


      const getIndexOldBackwardsBuffer = () => {
        if (this.currentIndex - 3 < 0) {
          return this.playlist.tracks.length - 3 + this.currentIndex;
        } else {
          return this.currentIndex - 3
        }
      }

      if (this.playlist.tracks.length > 5) {
        if (typeof this.playlist.tracks[getIndexForwardsBuffer()].player === 'undefined') {
          this.playlist.tracks[getIndexForwardsBuffer()].player = new Howl({
            src: [[this.playlist.path, this.playlist.tracks[getIndexForwardsBuffer()].filename].join('%5C')],
            volume: this.playlist.tracks[getIndexForwardsBuffer()].trackvolume, loop: this.playlist.tracks[getIndexForwardsBuffer()].isLooping
          })
        }
        this.playlist.tracks[getIndexOldBackwardsBuffer()].player.unload()
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

      const getIndexOldForwardsBuffer = () => {
        if (this.currentIndex + 3 > this.playlist.tracks.length - 1) {
          return this.currentIndex + 3 - this.playlist.tracks.length;
        } else {
          return this.currentIndex + 3;
        }
      }

      const getIndexBackwardsBuffer = () => {
        if (this.currentIndex - 2 < 0) {
          return this.playlist.tracks.length - 2 + this.currentIndex;
        } else {
          return this.currentIndex - 2
        }
      }


      if (this.playlist.tracks.length > 5) {
        if (typeof this.playlist.tracks[getIndexBackwardsBuffer()].player === 'undefined') {
          this.playlist.tracks[getIndexBackwardsBuffer()].player = new Howl({
            src: [[this.playlist.path, this.playlist.tracks[getIndexBackwardsBuffer()].filename].join('%5C')],
            volume: this.playlist.tracks[getIndexBackwardsBuffer()].trackvolume, loop: this.playlist.tracks[getIndexBackwardsBuffer()].isLooping
          })
        }
        this.playlist.tracks[getIndexOldForwardsBuffer()].player.unload()
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
        this.loadPlayerBuffer()
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

        this.playlist.tracks.splice(song.settings.pos, 0, song.settings)
        this._triggerPosUpdate()

        this.writeToConfig(this.playlist)
        this.loadPlayerBuffer()
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
        if (!this.isPlaying) {
          this.playlist.tracks.splice(this.playlist.tracks.indexOf(track), 1)

          await this.writeToConfig(this.playlist)

          if (this.playlist.tracks.length === track.pos) {
            this.advanceToNextIndex()
          }
        } else {
          console.error("Track kann nicht removed werden, wenn Player spielt.");
        }
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

      this._triggerPosUpdate()

      const objMask = ({ name, filename, trackvolume, fadeInDuration, fadeOutDuration, isLooping, pos }) => ({ name, filename, trackvolume, fadeInDuration, fadeOutDuration, isLooping, pos })

      content.tracks.forEach(track => temp.tracks.push(objMask(track)))

      await writeFile({ path: [this.path, '.soundboard', 'playlist.config.json'].join('\\'), contents: JSON.stringify(temp) })
      console.debug('Written to config')
    },

    /**
     * Devtool: Resetet Song & Block
     */
    resetSong() {
      //Triggert in MediaControls.vue einen Watcher, der blockTrackChange auf false setzt
      this.resetSong = !this.resetSong
      try {
        this.current.player.stop()
        this.next.player.stop()
        this.previous.player.stop()
      } catch {
        console.error("Reset Song: Fehler beim reseten des Songs");
      }

      try {
        this.current.player = new Howl({ src: [[this.playlist.path, this.current.filename].join('%5C')], volume: this.current.trackvolume, loop: this.current.isLooping })
        this.next.player = new Howl({ src: [[this.playlist.path, this.next.filename].join('%5C')], volume: this.next.trackvolume, loop: this.next.isLooping })
        this.previous.player = new Howl({ src: [[this.playlist.path, this.previous.filename].join('%5C')], volume: this.previous.trackvolume, loop: this.previous.isLooping })
      } catch {
        console.error("Reset Song: Fehler beim erstellen der neuen Player");
      }
    },

    loadPlayerBuffer() {
      const getIndexForwardsBuffer = () => {
        if (this.currentIndex + 2 > this.playlist.tracks.length - 1) {
          return (this.currentIndex + 2) - this.playlist.tracks.length;
        } else {
          return this.currentIndex + 2;
        }
      }

      const getIndexBackwardsBuffer = () => {
        if (this.currentIndex - 2 < 0) {
          return this.playlist.tracks.length - 2 + this.currentIndex;
        } else {
          return this.currentIndex - 2
        }
      }

      //Lädt wenn es genügend Elemente gibt den Player für Current und die zwei davor und danach liegenden Tracks
      if (this.playlist.tracks.length > 0) {
        this.current.player = new Howl({ src: [[this.playlist.path, this.current.filename].join('%5C')], volume: this.current.trackvolume, loop: this.current.isLooping })
        if (this.playlist.tracks.length > 1) {
          this.next.player = new Howl({ src: [[this.playlist.path, this.next.filename].join('%5C')], volume: this.next.trackvolume, loop: this.next.isLooping })
          if (this.playlist.tracks.length > 2) {
            this.previous.player = new Howl({ src: [[this.playlist.path, this.previous.filename].join('%5C')], volume: this.previous.trackvolume, loop: this.previous.isLooping })
            if (this.playlist.tracks.length > 3) {
              this.playlist.tracks[getIndexForwardsBuffer()].player = new Howl({
                src: [[this.playlist.path, this.playlist.tracks[getIndexForwardsBuffer()].filename].join('%5C')],
                volume: this.playlist.tracks[getIndexForwardsBuffer()].trackvolume, loop: this.playlist.tracks[getIndexForwardsBuffer()].isLooping
              })
              if (this.playlist.tracks.length > 4) {
                this.playlist.tracks[getIndexBackwardsBuffer()].player = new Howl({
                  src: [[this.playlist.path, this.playlist.tracks[getIndexBackwardsBuffer()].filename].join('%5C')],
                  volume: this.playlist.tracks[getIndexBackwardsBuffer()].trackvolume, loop: this.playlist.tracks[getIndexBackwardsBuffer()].isLooping
                })
              }
            }
          }
        }
      } else {
        console.error('No Player loaded')
      }

    }
  }
})
