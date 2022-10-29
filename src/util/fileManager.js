import { open } from "@tauri-apps/api/dialog"
import { exists, readTextFile, readDir, writeFile, createDir } from "@tauri-apps/api/fs"
import { convertFileSrc } from '@tauri-apps/api/tauri';


/**
 * Öffnet Speicherplatz einer Playlist und sucht nach 'playlist.config.json'
 * Wenn 'playlist.config.json' existiert, wird die Playlist Config ausgelesen und returnt.
 * Wenn 'playlist.config.json' nicht existiert, wird ein neues '.soundboard' Dir und Config File erstellt
 * und mit allen unterstützten Sounddateien in Ordner gefüllt. 
 * @returns Playlist Object
 */
async function loadPlaylist() {
    try {
        let path = await open({
            directory: true,
            multiple: false,
            title: "Open Text File"
        })

        let configPath = path
        let playlistConfig = undefined

        //INFO Gesamter Filepath muss in erstem Arg angegeben werden

        //Sucht erst im '.soundboard' Unterordner
        if (await exists([configPath, '.soundboard', 'playlist.config.json'].join('\\'))) {
            console.debug("Config File in '.soundboard' gefunden.")
            configPath = [configPath, '.soundboard', 'playlist.config.json'].join('\\')
        } else if (await exists([configPath, 'playlist.config.json'].join('\\'))) { //Wenn Config nicht im Unterordner gefunden wird, dann wird das Base Dir durchsucht
            console.debug('Config File in Base Dir gefunden.')
            configPath = [configPath, 'playlist.config.json'].join('\\')
        } else { // Wenn gar keine Config Datei gefunden wurde, wird eine neue erstellt.
            const _array = path.split('\\')
            playlistConfig = {
                name: _array[_array.length - 1],
                tracks: []
            }

            for (const track of await readDir(path)) {
                playlistConfig.tracks.push({
                    name: track.name.split('.')[0],
                    filename: track.name,
                    trackvolume: 1,
                    isLooping: true,
                    fadeOutDuration: 2000,
                    fadeInDuration: 2000
                })
            }

            await createDir([configPath, '.soundboard'].join('\\'), { recursive: true });
            await writeFile({path: [configPath, '.soundboard', 'playlist.config.json'].join('\\'), contents: JSON.stringify(playlistConfig)})

            configPath = [configPath, '.soundboard', 'playlist.config.json'].join('\\')
        }

        
        //Wird ausgelesen, wenn 'playlistConfig' wenn keine neue Config Datei erstellt wurde.
        playlistConfig = typeof playlistConfig !== 'undefined' ? playlistConfig : JSON.parse(await readTextFile(configPath))

        //INFO Path ist die API URL aus Tauri
        //Siehe https://tauri.app/v1/api/js/tauri#convertfilesrc
        playlistConfig.path = convertFileSrc(path)

        return playlistConfig
    } catch (e) {
        console.error(e)
    }
}

export {
    loadPlaylist
}