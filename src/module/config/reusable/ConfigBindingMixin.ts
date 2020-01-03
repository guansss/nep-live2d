import ConfigModule from '@/module/config/ConfigModule';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

type SettingsComponent = { configModule?: ConfigModule };

@Component
export default class ConfigBindingMixin extends Vue {
    @Prop({ default: '', type: String }) readonly config!: string;

    // v-model
    readonly value!: any;

    created() {
        if (this.config) {
            const configModule = (this.$parent as SettingsComponent).configModule!;

            this.updateValue(configModule.getConfig(this.config, this.value));

            configModule.app.on('config:' + this.config, this.updateValue, this);
        }
    }

    @Watch('value')
    valueChanged(value: any) {
        if (this.config) {
            (this.$parent as SettingsComponent).configModule!.setConfig(this.config, value);
        }
    }

    updateValue(value: any) {
        this.$emit('change', value);
    }

    beforeDestroy() {
        if (this.config) {
            (this.$parent as SettingsComponent).configModule!.app.off('config:' + this.config, this.updateValue);
        }
    }
}
