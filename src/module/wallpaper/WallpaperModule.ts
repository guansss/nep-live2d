import { App, Module } from '@/App';
import { inWallpaperEngine, redirectedFromBridge } from '@/core/utils/misc';
import { getJSON } from '@/core/utils/net';
import { WEInterface } from '@/module/wallpaper/WEInterface';

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
            }
        } else {
            await setupDefault();
        }
    }
}

async function setupRemote() {
    try {
        const { userProps, generalProps } = await getJSON('/props');

        if (userProps || generalProps) {
            generalProps && window.wallpaperPropertyListener.applyGeneralProperties(generalProps);
            userProps && window.wallpaperPropertyListener.applyUserProperties(userProps);
        } else {
            // noinspection ExceptionCaughtLocallyJS
            throw 'Empty response';
        }
    } catch (e) {
        console.error('Failed to retrieve Wallpaper Engine properties from Webpack DevServer:', e);
    }
}

async function setupDefault() {
    try {
        // actually loading "/wallpaper/project.json", but "/wallpaper" is the content root of DevServer,
        //  so we need to call "/project.json"
        const project = await getJSON('/project.json');

        if (project) {
            window.wallpaperPropertyListener.applyUserProperties(project.general.properties);
        } else {
            // noinspection ExceptionCaughtLocallyJS
            throw 'Empty response';
        }
    } catch (e) {
        console.error('Failed to load /wallpaper/project.json, have you run `yarn setup` ?', e);
    }
}
