import ConfigModule from '@/module/config/ConfigModule';
import FloatingPanelMixin from '@/module/config/FloatingPanelMixin';
import BackgroundSettings from '@/module/config/settings/BackgroundSettings.vue';
import EffectsSettings from '@/module/config/settings/EffectsSettings.vue';
import GeneralSettings from '@/module/config/settings/GeneralSettings.vue';
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator';

@Component
export default class SettingsPanel extends Mixins(FloatingPanelMixin) {
    // use getter function to prevent Vue's observation on ConfigModule instance
    @Prop() readonly configModule!: () => ConfigModule;

    @Ref('settings') readonly panel!: HTMLDivElement;
    @Ref('content') readonly content!: HTMLDivElement;
    @Ref('toolbar') readonly handle!: HTMLDivElement;

    readonly pages = [GeneralSettings, BackgroundSettings, EffectsSettings];

    selectedPage = 0;

    get currentPage() {
        return this.pages[this.selectedPage];
    }

    get cachedConfigModule() {
        return this.configModule();
    }

    protected mounted() {
        this.cachedConfigModule.app.on('we:schemeColor', (color: string) => {
            const rgb = color
                .split(' ')
                .map(float => ~~(parseFloat(float) * 255))
                .join(',');
            document.documentElement.style.setProperty('--accentColor', `rgb(${rgb})`);
        });

        this.switchTop = this.cachedConfigModule.getConfig('settings.switchTop', this.switchTop);
        this.switchLeft = this.cachedConfigModule.getConfig('settings.switchLeft', this.switchLeft);

        this.panelTop = this.cachedConfigModule.getConfig('settings.panelTop', this.panelTop);
        this.panelLeft = this.cachedConfigModule.getConfig('settings.panelLeft', this.panelLeft);
    }

    protected switchMoveEnded() {
        this.cachedConfigModule.setConfig('settings.switchTop', this.switchTop);
        this.cachedConfigModule.setConfig('settings.switchLeft', this.switchLeft);
    }

    protected panelMoveEnded() {
        this.cachedConfigModule.setConfig('settings.panelTop', this.panelTop);
        this.cachedConfigModule.setConfig('settings.panelLeft', this.panelLeft);
    }

    refresh() {
        location.reload();
    }
}
