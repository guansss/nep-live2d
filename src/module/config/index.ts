import { App, Module } from '@/App';
import { EventEntity } from '@/core/utils/EventEmitter';
import { error, Tagged } from '@/core/utils/log';
import SettingsPanel from '@/module/config/SettingsPanel.vue';
import get from 'lodash/get';
import set from 'lodash/set';

export interface Config {
    [key: string]: any;
}

export interface App {
    on(event: 'configInit', fn: (config: Config) => void, context?: any): this;

    // Will be emitted on each update of config
    on(event: 'config:*', fn: (path: string, value: any, oldValue: any, config: Config) => void, context?: any): this;

    on(event: 'config:{path}', fn: (value: any, oldValue: any, config: Config) => void, context?: any): this;

    emit(event: 'config:*', path: string, value: any, oldValue: any, config: Config): this;

    emit(event: 'config:{path}', value: any, oldValue: any, config: Config): this;

    emit(event: 'config', path: string, value: any): this;
}

/**
 * Handles configurations, must be installed before other modules that listen for `configInit` events.
 */
export default class ConfigModule implements Module, Tagged {
    tag = ConfigModule.name;

    name = 'Config';

    storageKey = 'config';

    readonly config: Config = {};

    constructor(private app: App) {
        this.read();

        app.on('config', this.setConfig, this);

        // immediately call listener of `configInit` when it's added
        app.on('newListener', (event: string, listener: EventEntity, context: any) => {
            if (event === 'configInit') {
                listener.fn.call(listener.context, this.config);

                if (listener.once) app.off(event, listener.fn, undefined, true);
            }
        });

        app.emit('configInit', this.config);

        SettingsPanel.prototype.configModule = this;

        app.addComponent(SettingsPanel).then();
    }

    setConfig(path: string, value: any) {
        const oldValue = get(this.config, path, undefined);

        set(this.config, path, value);
        this.save();

        this.app.emit('config:' + path, value, oldValue, this.config);
        this.app.emit('config:*', path, value, oldValue, this.config);
    }

    getConfig(path: string, defaultValue: any) {
        return get(this.config, path, defaultValue);
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
