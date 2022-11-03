import { open } from "@tauri-apps/api/dialog"
import { exists, readTextFile, readDir, writeFile, createDir, removeFile, BaseDirectory } from "@tauri-apps/api/fs"
import { convertFileSrc } from '@tauri-apps/api/tauri';

/**
 * Öffnet Explorer Dialog, indem der User den Speicherplatz einer Playlist auswählen kann
 * und übergibt diesen an {@link loadPlaylist} weiter um Playlist zu laden.
 * @returns Playlist Object
 */
async function loadNewPlaylist() {
    try {
        let path = await open({
            directory: true,
            multiple: false,
            title: "Open Text File"
        })

        const _playlist = await loadPlaylist(path)

        console.log(path);

        return _playlist
    } catch (e) {
        console.error(e)
    }
}

/**
 * Öffnet Speicherplatz einer Playlist und sucht nach 'playlist.config.json'
 * Wenn 'playlist.config.json' existiert, wird die Playlist Config ausgelesen, geupdatet und als Obj returnt.
 * Wenn 'playlist.config.json' nicht existiert, wird ein neues '.soundboard' Dir und Config File erstellt
 * und mit allen unterstützten Sounddateien in Ordner gefüllt. 
 * @params {string} path - Absoluter Path zum Playlist Ordner
 * @returns Playlist Object
 */
async function loadPlaylist(path) {
    if(typeof path !== 'undefined'){
        try {
            //Convertiert Path zurück zu normalem Path
            if(path.startsWith('https://asset.localhost/')){
                path = path.slice(24).replaceAll('%3A', ':').replaceAll('%5C', '\\').replaceAll('%20', ' ')
                console.log(path);
            }

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
                const _pathSplit = path.split('\\')
                playlistConfig = {
                    name: _pathSplit[_pathSplit.length - 1],
                    tracks: []
                }
    
                configPath = [configPath, '.soundboard', 'playlist.config.json'].join('\\')
            }
    
            //Wird ausgelesen, wenn 'playlistConfig' wenn keine neue Config Datei erstellt wurde.
            playlistConfig = typeof playlistConfig !== 'undefined' ? playlistConfig : JSON.parse(await readTextFile(configPath))
    
            //Entfernt in Ordner fehlende Tracks aus playlistConfig        
            for (const track of playlistConfig.tracks) {
                if (!await exists([path, track.filename].join('\\'))) {
                    playlistConfig.tracks.splice(playlistConfig.tracks.indexOf(track), 1)
                }
            }
    
            //Fügt in playlistConfig nicht aufgeführte Tracks hinzu
            for (const file of (await readDir(path))) {
                const _nameSplit = file.name.split('.')
                if ((_nameSplit[_nameSplit.length - 1] === 'wav' || _nameSplit[_nameSplit.length - 1] === 'mp3' || _nameSplit[_nameSplit.length - 1] === 'ogg' || _nameSplit[_nameSplit.length - 1] === 'webm') && _nameSplit.length >= 2) {
                    if (!playlistConfig.tracks.some(val => val.filename === file.name)) {
                        playlistConfig.tracks.push({
                            name: _nameSplit[0],
                            filename: file.name,
                            trackvolume: 1,
                            isLooping: true,
                            fadeOutDuration: 2000,
                            fadeInDuration: 2000
                        })
                    }
                }
            }
    
            //Erstellt neuen '.soundboard' Ordner, wenn noch keiner existiert
            if (!await exists([path, '.soundboard'].join('\\'))) {
                await createDir([path, '.soundboard'].join('\\'), { recursive: true });
            }
    
            //Entfernt playlist.config.json File aus Root Ordner
            if (await exists([path, 'playlist.config.json'].join('\\'))) {
                await removeFile([path, 'playlist.config.json'].join('\\'));
            }
    
            //Erstellt/Überschreibt playlist.config
            await writeFile({ path: [path, '.soundboard', 'playlist.config.json'].join('\\'), contents: JSON.stringify(playlistConfig) })
    
            //INFO Path ist die API URL aus Tauri
            //Siehe https://tauri.app/v1/api/js/tauri#convertfilesrc
            playlistConfig.path = convertFileSrc(path)
    
            return playlistConfig
        } catch (e) {
            console.error(e)
        }
    }
}

/**
 * Lädt gewähltes Preset anhand des Filename
 * @param {String} filename Name der Config File des Presets
 * @returns
 */
async function loadPreset(filename) {
    try {
        if (await exists(['.soundboard', filename].join('\\'), { dir: BaseDirectory.Data })) {
            return JSON.parse(await readTextFile(['.soundboard', filename].join('\\'), { dir: BaseDirectory.Data }))
        } else { // Wenn gar keine Config Datei gefunden wurde, wird eine neue erstellt.
            //TODO Preset sollte dann removed werden.
            console.error('Die Config Datei des Presets konnte nicht gefunden werden')
            return undefined
        }
    } catch (e) {
        console.error(e)
    }
}

/**
 * Lädt alle gespeicherten Presets aus presets.config.json ein. 
 * 'presets.config.json' liegt im AppData des Nutzers und sollte nur vom Programm beschrieben werden.
 * Wenn noch kein presets.config.json Datei existiert, wird ein leerer Array zurückgegeben.
 * Eine Config Datei wir neu erstellt, wenn {@link addPreset} aufgerufen wird.
 * @returns {Array} Liste aller gespeicherten Presets
 */
async function loadAllPresets() {
    let content = []

    if (await exists('.soundboard\\presets.config.json', { dir: BaseDirectory.Data })) {
        content = JSON.parse(await readTextFile('.soundboard\\presets.config.json', { dir: BaseDirectory.Data }))
    }

    return content
}

export {
    loadNewPlaylist,
    loadPlaylist,
    loadPreset,
    loadAllPresets
}