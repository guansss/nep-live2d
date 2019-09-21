import { Module } from '@/App';
import { inWallpaperEngine } from '@/core/utils/misc';
import { getJSON } from '@/core/utils/net';
import { App } from '@/module/background/BackgroundModule';

export default class WallpaperModule implements Module {
    name = 'Wallpaper';

    constructor(readonly app: App) {
        this.init().then();
    }

    async init() {
        if (inWallpaperEngine) {
            // when this page is redirected from "bridge.html", a `redirect` will be set in URL's search parameters
            if (new URLSearchParams(location.search.slice(1)).get('redirect')) {
                let err;

                try {
                    const props = (await getJSON('/props')) as WEProperties;

                    if (props) this.setup(props);
                    else err = 'Empty response';
                } catch (e) {
                    err = e;
                }

                if (err) console.error('Failed to retrieve Wallpaper Engine properties from Webpack DevServer:', err);
            } else {
                // TODO: setup with cached properties
            }
        } else {
            // TODO: setup with default properties
        }
    }

    setup(props: WEProperties) {

    }
}
