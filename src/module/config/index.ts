import { App, Module } from '@/App';
import { EventEntity } from '@/core/utils/EventEmitter';
import { error, Tagged } from '@/core/utils/log';
import get from 'lodash/get';
import set from 'lodash/set';

export interface Config {
    [key: string]: any;
}

export interface App {
    on(
        event: 'configUpdate',
        fn: (path: string, oldValue: any, newValue: any, config: Config) => void,
        context?: any,
    ): this;

    emit(event: 'config', path: string, oldValue: any, newValue: any, config: Config): this;

    emit(event: 'config', path: string, value: any): this;
}

/**
 * Handles configurations, must be installed before other modules that listen for related events.
 */
export default class ConfigModule implements Module, Tagged {
    tag = ConfigModule.name;

    name = 'Config';

    storageKey = 'config';

    readonly config: Config = {};

    constructor(private app: App) {
        this.read();

        // immediately call listener of `configInit` when it's added
        app.on('newListener', (event: string, listener: EventEntity, context: any) => {
            if (event === 'configInit') {
                listener.fn.call(listener.context, this.config);

                if (listener.once) app.off(event, listener.fn, undefined, true);
            }
        });

        app.on('config', this.onConfig, this);
        app.emit('configInit', this.config);
    }

    onConfig(path: string, value: any) {
        const oldValue = get(this.config, path, value);

        set(this.config, path, value);
        this.save();

        this.app.emit('configUpdate', path, oldValue, value, this.config);
    }

    read() {
        try {
            const json = localStorage.getItem(this.storageKey);

            if (json) {
                Object.assign(this.config, JSON.parse(json));
            }
        } catch (e) {
            error(this, e);
        }
    }

    save(): boolean {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.config));
            return true;
        } catch (e) {
            error(this, e);
        }
        return false;
    }
}
