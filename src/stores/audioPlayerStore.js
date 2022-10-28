import { defineStore } from 'pinia'

export const useAudioPlayerStore = defineStore('audioPlayerStore', {
  state: () => ({ 
    playlist: undefined,
    soundeffects: undefined,
    currentIndex: 0,
    current: {
      name: '...'
    }
  }),
  getters: {

  },
  actions: {
  },
})
