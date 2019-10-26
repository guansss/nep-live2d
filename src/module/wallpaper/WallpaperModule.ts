import { App, Module } from '@/App';
import { error } from '@/core/utils/log';
import { inWallpaperEngine, redirectedFromBridge } from '@/core/utils/misc';
import { getJSON, postJSON } from '@/core/utils/net';
import { WEInterface } from '@/module/wallpaper/WEInterface';
import debounce from 'lodash/debounce';

export default class WallpaperModule implements Module {
    name = 'Wallpaper';

    constructor(readonly app: App) {
        WEInterface.setEventEmitter(app);

        this.init().then();
    }

    async init() {
        if (inWallpaperEngine) {
            if (redirectedFromBridge) {
                await setupRemote();

                // must use a debounce because property can change rapidly, for example when using a color picker
                this.app.on('we:*', debounce(updateRemoteProperty, 100));

                this.app.on('weFilesUpdate:*', updateRemoteFiles).on('weFilesRemove:*', updateRemoteFiles);
            }
        } else {
            await setupDefault();
        }
    }
}

async function setupDefault() {
    try {
        // actually loading "wallpaper/project.json", but "wallpaper" is the content root of DevServer,
        //  so we need to call "project.json"
        const project = await getJSON('project.json');

        if (project) {
            window.wallpaperPropertyListener.applyUserProperties(project.general.properties);
        } else {
            // noinspection ExceptionCaughtLocallyJS
            throw 'Empty response';
        }
    } catch (e) {
        error('WE', 'Failed to load project.json, have you run `yarn setup` ?', e);
    }
}

async function setupRemote() {
    try {
        const props = await getJSON('/props');

        if (props) {
            props.generalProps && window.wallpaperPropertyListener.applyGeneralProperties(props.generalProps);
            props.userProps && window.wallpaperPropertyListener.applyUserProperties(props.userProps);

            if (props.files) {
                Object.entries(props.files).forEach(([propName, files]) => {
                    // files can be null if the directory is unset
                    if (files) {
                        window.wallpaperPropertyListener.userDirectoryFilesAddedOrChanged(propName, files as string[]);
                    }
                });
            }
        } else {
            // noinspection ExceptionCaughtLocallyJS
            throw 'Empty response';
        }
    } catch (e) {
        error('WE', 'Failed to retrieve Wallpaper Engine properties from Webpack DevServer:', e);
    }
}

// update remote properties so they can be retrieved after HMR
function updateRemoteProperty(propName: string, value: string) {
    postJSON('/props', {
        // no need to care about putting the property in userProps or generalProps, because they will finally be merged
        userProps: { [propName]: { value } },
    }).catch();
}

function updateRemoteFiles(propName: string, files: string[], allFiles: string[]) {
    postJSON('/props', {
        files: { [propName]: allFiles.map(file => file.slice('file://'.length)) },
    }).catch();
}
