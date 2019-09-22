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
        } else {
            // TODO: setup with default properties
        }
    }
}
