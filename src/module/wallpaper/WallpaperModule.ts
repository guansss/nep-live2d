import { App, Module } from '@/App';
import { EventEntity } from '@/core/utils/EventEmitter';
import { inWallpaperEngine } from '@/core/utils/misc';
import { getJSON } from '@/core/utils/net';

export interface App {
    on(event: 'we:{prop}', fn: (value: string | number) => void, context?: any): this;
}

const PREFIX = 'we:';

const EVENT_MAP_USER = {
    schemecolor: 'schemeColor',
};

export default class WallpaperModule implements Module {
    name = 'Wallpaper';

    userProps: WEUserProperties = {};
    generalProps: WEGeneralProperties = {};

    constructor(readonly app: App) {
        // immediately call the listener when it's added
        app.on('newListener', (event: string, listener: EventEntity, context: any) => {
            if (event.startsWith(PREFIX)) {
                const name = event.slice(PREFIX.length);
                const prop = this.userProps[name] || this.generalProps[name];

                if (prop) {
                    listener.fn.call(listener.context, prop.value);

                    if (listener.once) app.off(event, listener.fn, undefined, true);
                }
            }
        });

        this.init().then();
    }

    async init() {
        if (inWallpaperEngine) {
            // when this page is redirected from "bridge.html", a `redirect` will be set in URL's search parameters
            if (new URLSearchParams(location.search.slice(1)).get('redirect')) {
                try {
                    const { userProps, generalProps } = await getJSON('/props');

                    if (userProps || generalProps) {
                        this.setup(userProps, generalProps);
                    } else {
                        // noinspection ExceptionCaughtLocallyJS
                        throw 'Empty response';
                    }
                } catch (e) {
                    console.error('Failed to retrieve Wallpaper Engine properties from Webpack DevServer:', e);
                }
            } else {
                // TODO: setup with cached properties
            }
        } else {
            // TODO: setup with default properties
        }
    }

    // all properties must be available on setup
    setup(userProps: WEUserProperties, generalProps: WEGeneralProperties) {
        this.updateUserProps(userProps);
    }

    // only one of the properties is available on each update
    updateUserProps(props: WEUserProperties) {
        Object.assign(this.userProps, props);

        Object.entries(EVENT_MAP_USER).forEach(([name, event]) => {
            this.emitString(props, name, event);
        });
    }

    emitString(props: WEProperties, name: string, event: string) {
        if (props[name]) {
            this.app.emit(PREFIX + event, props[name]!.value);
        }
    }

    emitNumber(props: WEProperties, name: string, event: string) {
        if (props[name]) {
            const number = parseInt(props[name]!.value as string);

            if (!isNaN(number)) {
                this.app.emit(PREFIX + event, number);
            }
        }
    }
}
