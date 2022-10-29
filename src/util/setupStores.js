//WARNING Dies ist eine Temporäte Datei, die nicht ins Endprodukt übernommen werden soll
//INFO setupStores.js setzt die default Wert in den Store ein. Dies wird später über auslesen von Dateinen geregelt.

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
        name: "Szene 1 Atmo 1",
        src: "./music/Szene1/ForestAmbiente1.wav",
        trackvolume: 1,
        isLooping: true,
        fadeOutDuration: 5000,
        fadeInDuration: 5000
    },
    {
        name: "Szene 1 Atmo 2",
        src: "./music/Szene1/ForestAmbiente2.wav",
        trackvolume: 1,
        isLooping: true,
        fadeOutDuration: 2000,
        fadeInDuration: 2000
    },{
        name: "Szene 1 Magic Atmo",
        src: "./music/Szene1/MagicSound.wav",
        trackvolume: 1,
        isLooping: true,
        fadeOutDuration: 2000,
        fadeInDuration: 2000
    },
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
