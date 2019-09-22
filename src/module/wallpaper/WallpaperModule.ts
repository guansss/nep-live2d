import { App, Module } from '@/App';
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
                this.app.on('we:*', debounce(updateRemote, 200));
            }
        } else {
            await setupDefault();
        }
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

// update remote properties so they can be retrieved after HMR
function updateRemote(prop: string, value: string) {
    postJSON('/props', {
        // no need to care about putting the property in userProps or generalProps, because they will finally be merged
        userProps: { [prop]: { value } },
    }).catch();
}
