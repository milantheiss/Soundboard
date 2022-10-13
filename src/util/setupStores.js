//WARNING Die ist eine Temporäte Datei, die nicht ins Endprodukt übernommen werden soll

import { useAudioPlayerStore } from '@/stores/audioPlayerStore.js'

const soundeffects = [
    {
        name: "Zelda Chest",
        src: "./soundeffects/Zelda Open Chest.mp3",
        trackvolume: 0.5,
        isLooping: true,
        fadeOutDuration: 1000,
        fadeInDuration: 0
    }
]
const playlist = [
    {
        name: "Song of Storms",
        src: "./music/Song of Storms - Ocarina of Time.wav",
        trackvolume: 0.1,
        isLooping: true,
        fadeOutDuration: 5000,
        fadeInDuration: 10000
    },
    {
        name: "Warcraft Theme",
        src: "./music/Warcraft The Beginning Soundtrack - (01) Warcraft.mp3",
        trackvolume: 1.0,
        isLooping: false,
        fadeOutDuration: 5000,
        fadeInDuration: 10000
    },
    {
        name: "Gerudo Valley",
        src: "./music/Gerudo Valley - Ocarina of Time.wav",
        trackvolume: 0.1,
        isLooping: false,
        fadeOutDuration: 5000,
        fadeInDuration: 1000
    }
]

//Ordnet States Werte zu.
const setupStores = () => {
    const audioPlayerStore = useAudioPlayerStore()
    
    audioPlayerStore.soundeffects = soundeffects
    audioPlayerStore.playlist = playlist
}

export {
    setupStores
}
