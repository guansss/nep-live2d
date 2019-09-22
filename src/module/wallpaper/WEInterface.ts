import EventEmitter, { EventEntity } from '@/core/utils/EventEmitter';

export interface App {
    on(event: 'we:{prop}', fn: (value: string | number) => void, context?: any): this;

    on(event: 'we:*', fn: (name: string, value: string | number) => void, context?: any): this;
}

export namespace WEInterface {
    export const PREFIX = 'we:';

    const TYPE_MAP: { [name: string]: string } = {
        schemecolor: 'string',
    };

    export const props: WEProperties = {};

    let eventEmitter: EventEmitter;

    export function setEventEmitter(emitter: EventEmitter) {
        eventEmitter = emitter;

        // immediately emit all properties
        Object.keys(props).forEach(emitProp);

        // immediately call the new listener when it's added
        emitter.on('newListener', (event: string, listener: EventEntity, context: any) => {
            if (event.startsWith(PREFIX) && event !== PREFIX + '*') {
                const value = getPropValue(event.slice(PREFIX.length));

                if (value) {
                    listener.fn.call(listener.context, value);

                    if (listener.once) emitter.off(event, listener.fn, undefined, true);
                }
            }
        });
    }

    export function updateProps(_props: WEProperties) {
        Object.assign(props, _props);
        Object.keys(_props).forEach(emitProp);
    }

    export function getPropValue(name: string): string | number | undefined {
        const prop = props[name];
        const type = TYPE_MAP[name];

        if (prop) {
            switch (type) {
                case 'number': {
                    const number = parseInt(prop.value as string);

                    if (!Number.isNaN(number)) return number;
                    break;
                }

                case 'string':
                default:
                    return prop.value;
            }
        }
    }

    function emitProp(name: string) {
        if (eventEmitter) {
            const value = getPropValue(name);

            if (value) {
                eventEmitter.emit(PREFIX + name, value);
                eventEmitter.emit(PREFIX + '*', name, value);
            }
        }
    }
}

window.wallpaperPropertyListener = {
    applyUserProperties: props => WEInterface.updateProps(props as WEProperties),
    applyGeneralProperties: props => WEInterface.updateProps(props as WEProperties),
};
