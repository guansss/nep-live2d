import { App, Module } from '@/App';
import { EventEntity } from '@/core/utils/EventEmitter';
import { inWallpaperEngine } from '@/core/utils/misc';
import { getJSON } from '@/core/utils/net';

export interface App {
    on(event: 'we:{prop}', fn: (value: string | number) => void, context?: any): this;
}

const PREFIX = 'we:';

const EVENT_MAP = {
    schemecolor: ['schemeColor', 'string'],
};

export default class WallpaperModule implements Module {
    name = 'Wallpaper';

    props: WEProperties = {};

    constructor(readonly app: App) {
        // immediately call the listener when it's added
        app.on('newListener', (event: string, listener: EventEntity, context: any) => {
            if (event.startsWith(PREFIX)) {
                const name = event.slice(PREFIX.length);

                if (this.props[name]) {
                    listener.fn.call(listener.context, this.props[name]!.value);

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
                        generalProps && this.updateProps(generalProps);
                        userProps && this.updateProps(userProps);
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

    updateProps(props: WEProperties) {
        Object.entries(EVENT_MAP).forEach(([name, [event, type]]) => {
            const prop = props[name];

            if (prop) {
                switch (type) {
                    case 'number': {
                        const number = parseInt(this.props[name]!.value as string);

                        if (!Number.isNaN(number)) {
                            this.app.emit(PREFIX + event, number);
                        }
                        break;
                    }

                    case 'string':
                    default:
                        this.app.emit(PREFIX + event, prop.value);
                }
            }
        });

        Object.assign(this.props, props);
    }
}
