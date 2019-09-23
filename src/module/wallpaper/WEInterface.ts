import EventEmitter, { EventEntity } from '@/core/utils/EventEmitter';
import union from 'lodash/union';

export interface App {
    on(event: 'we:*', fn: (name: string, value: string | number) => void, context?: any): this;

    on(event: 'we:{prop}', fn: (value: string | number) => void, context?: any): this;

    on(event: 'weFilesUpdate:{prop}', fn: (files: string[], allFiles: string[]) => void, context?: any): this;

    on(event: 'weFilesRemove:{prop}', fn: (files: string[], allFiles: string[]) => void, context?: any): this;
}

export namespace WEInterface {
    export const PREFIX = 'we:';
    export const PREFIX_FILES_UPDATE = 'weFilesUpdate:';
    export const PREFIX_FILES_REMOVE = 'weFilesRemove:';

    export const props: WEProperties = {};

    export const propFiles: { [propName: string]: string[] } = {};

    const TYPE_MAP: { [name: string]: string } = {
        schemecolor: 'string',
    };

    let eventEmitter: EventEmitter;

    export function setEventEmitter(emitter: EventEmitter) {
        eventEmitter = emitter;

        // immediately emit all properties and files
        Object.keys(props).forEach(emitProp);
        Object.entries(propFiles).forEach(([propName, files]) => emitFilesUpdate(propName, files));

        // immediately call the new listener when it's added
        emitter.on('newListener', (event: string, listener: EventEntity, context: any) => {
            const prefix = event.slice(0, event.indexOf(':') + 1);

            if (prefix === PREFIX) {
                if (event !== PREFIX + '*') {
                    const value = getPropValue(event.slice(PREFIX.length));

                    if (value) {
                        listener.fn.call(listener.context, value);

                        if (listener.once) emitter.off(event, listener.fn, undefined, true);
                    }
                }
            } else if (prefix === PREFIX_FILES_UPDATE) {
                const files = propFiles[event.slice(PREFIX_FILES_UPDATE.length)];

                if (files) {
                    listener.fn.call(listener.context, files, files);

                    if (listener.once) emitter.off(event, listener.fn, undefined, true);
                }
            }
        });
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

    function updateProps(_props: WEProperties) {
        Object.assign(props, _props);
        Object.keys(_props).forEach(emitProp);
    }

    function updateFiles(propName: string, files: string[]) {
        if (propFiles[propName]) {
            propFiles[propName] = union(propFiles[propName], files);
        } else {
            propFiles[propName] = files;
        }

        emitFilesUpdate(propName, files);
    }

    function removeFiles(propName: string, files: string[]) {
        if (propFiles[propName]) {
            propFiles[propName] = propFiles[propName].filter(file => !files.includes(file));
        } else {
            // make sure the array exists even when it's empty
            propFiles[propName] = [];
        }

        emitFilesRemove(propName, files);
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

    function emitFilesUpdate(propName: string, files: string[]) {
        if (eventEmitter) {
            eventEmitter.emit(PREFIX_FILES_UPDATE + propName, files, propFiles[propName]);
            eventEmitter.emit(PREFIX_FILES_UPDATE + '*', propName, files, propFiles[propName]);
        }
    }

    function emitFilesRemove(propName: string, files: string[]) {
        if (eventEmitter) {
            eventEmitter.emit(PREFIX_FILES_REMOVE + propName, files, propFiles[propName]);
            eventEmitter.emit(PREFIX_FILES_REMOVE + '*', propName, files, propFiles[propName]);
        }
    }

    window.wallpaperPropertyListener = {
        applyUserProperties: updateProps,
        applyGeneralProperties: updateProps,

        userDirectoryFilesAddedOrChanged(propName, files) {
            // add prefixes to raw file paths
            updateFiles(propName, files.map(file => 'file://' + file));
        },
        userDirectoryFilesRemoved(propName, files) {
            removeFiles(propName, files.map(file => 'file://' + file));
        },
    };
}
