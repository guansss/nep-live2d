import EventEmitter from '@/core/utils/EventEmitter';
import union from 'lodash/union';

export interface App {
    on(event: 'we:*', fn: (name: string, value: string | number) => void, context?: any): this;

    on<T extends keyof WEProperties>(event: 'we:{T}', fn: (value: string) => void, context?: any): this;

    on<T extends keyof WEFiles>(
        event: 'weFilesUpdate:{T}',
        fn: (files: string[], allFiles: string[]) => void,
        context?: any,
    ): this;

    on<T extends keyof WEFiles>(
        event: 'weFilesRemove:{T}',
        fn: (files: string[], allFiles: string[]) => void,
        context?: any,
    ): this;
}

export namespace WEInterface {
    export const PREFIX = 'we:';
    export const PREFIX_FILES_UPDATE = 'weFilesUpdate:';
    export const PREFIX_FILES_REMOVE = 'weFilesRemove:';

    export const props: Partial<WEProperties> = {};

    export const propFiles: WEFiles = {};

    let eventEmitter: EventEmitter;

    export function setEventEmitter(emitter: EventEmitter) {
        eventEmitter = emitter;

        // immediately emit all properties and files
        (Object.keys(props) as (keyof WEProperties)[]).forEach(emitProp);
        (Object.entries(propFiles) as [keyof WEFiles, string[]][]).forEach(([propName, files]) =>
            emitFilesUpdate(propName, files),
        );
    }

    export function getPropValue<T extends keyof WEProperties>(name: T): string | undefined {
        const prop = props[name];

        if (prop) {
            return typeof prop === 'string' ? prop : prop.value;
        }
    }

    function updateProps(_props: Partial<WEProperties>) {
        Object.assign(props, _props);
        (Object.keys(_props) as (keyof WEProperties)[]).forEach(emitProp);
    }

    function updateFiles<T extends keyof WEFiles>(propName: T, files: string[]) {
        if (propFiles[propName]) {
            propFiles[propName] = union(propFiles[propName], files);
        } else {
            propFiles[propName] = files;
        }

        emitFilesUpdate(propName, files);
    }

    function removeFiles<T extends keyof WEFiles>(propName: T, files: string[]) {
        if (propFiles[propName]) {
            propFiles[propName] = propFiles[propName]!.filter(file => !files.includes(file));
        } else {
            // make sure the array exists even when it's empty
            propFiles[propName] = [];
        }

        emitFilesRemove(propName, files);
    }

    function emitProp<T extends keyof WEProperties>(name: T) {
        if (eventEmitter) {
            const value = getPropValue(name);

            if (value) {
                eventEmitter.sticky(PREFIX + name, value);
                eventEmitter.sticky(PREFIX + '*', name, value);
            }
        }
    }

    function emitFilesUpdate<T extends keyof WEFiles>(propName: T, files: string[]) {
        if (eventEmitter) {
            eventEmitter.sticky(PREFIX_FILES_UPDATE + propName, files, propFiles[propName]);
            eventEmitter.sticky(PREFIX_FILES_UPDATE + '*', propName, files, propFiles[propName]);
        }
    }

    function emitFilesRemove<T extends keyof WEFiles>(propName: T, files: string[]) {
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
            updateFiles(propName, files.map(file => 'file://' + unescape(file)));
        },
        userDirectoryFilesRemoved(propName, files) {
            removeFiles(propName, files.map(file => 'file://' + unescape(file)));
        },

        setPaused(paused) {
            eventEmitter && eventEmitter.sticky(paused ? 'pause' : 'resume');
        },
    };
}
