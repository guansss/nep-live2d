import { Vue } from '*.vue';
import ConfigModule from '@/module/config/ConfigModule';
import FloatingPanelMixin from '@/module/config/FloatingPanelMixin';
import Scrollable from '@/module/config/reusable/Scrollable.vue';
import BackgroundSettings from '@/module/config/settings/BackgroundSettings.vue';
import CharacterSettings from '@/module/config/settings/CharacterSettings.vue';
import EffectsSettings from '@/module/config/settings/EffectsSettings.vue';
import GeneralSettings from '@/module/config/settings/GeneralSettings.vue';
import LogSettings from '@/module/config/settings/LogSettings.vue';
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator';

@Component({
    components: { Scrollable },
})
export default class SettingsPanel extends Mixins(FloatingPanelMixin) {
    // use getter function to prevent Vue's observation on ConfigModule instance
    @Prop() readonly configModule!: () => ConfigModule;

    @Ref('settings') readonly panel!: HTMLDivElement;
    @Ref('content') readonly content!: HTMLDivElement;
    @Ref('toolbar') readonly handle!: HTMLDivElement;
    @Ref('resizer') readonly resizer!: HTMLDivElement;
    @Ref('page') readonly pageComponent!: Vue;

    readonly pages = [GeneralSettings, CharacterSettings, BackgroundSettings, EffectsSettings, LogSettings];

    selectedPage = 0;

    get currentPage() {
        return this.pages[this.selectedPage];
    }

    get cachedConfigModule() {
        return this.configModule();
    }

    protected mounted() {
        this.cachedConfigModule.app.on('we:schemecolor', (color: string) => {
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
        this.panelWidth = this.cachedConfigModule.getConfig('settings.panelWidth', this.panelWidth);
        this.panelHeight = this.cachedConfigModule.getConfig('settings.panelHeight', this.panelHeight);
    }

    async selectPage(index: number) {
        this.selectedPage = index;

        // notify selected child to load stuffs, this is probably not a good design...
        await this.$nextTick();
        this.afterOpen();
    }

    protected switchMoveEnded() {
        this.cachedConfigModule.setConfig('settings.switchTop', this.switchTop);
        this.cachedConfigModule.setConfig('settings.switchLeft', this.switchLeft);
    }

    protected panelMoveEnded() {
        this.cachedConfigModule.setConfig('settings.panelTop', this.panelTop);
        this.cachedConfigModule.setConfig('settings.panelLeft', this.panelLeft);
    }

    protected panelResizeEnded() {
        this.cachedConfigModule.setConfig('settings.panelWidth', this.panelWidth);
        this.cachedConfigModule.setConfig('settings.panelHeight', this.panelHeight);
    }

    protected afterOpen() {
        const component = this.pageComponent as any;
        component && component.afterOpen && component.afterOpen();
    }

    protected beforeClose() {
        const component = this.pageComponent as any;
        component && component.beforeClose && component.beforeClose();
    }

    refresh() {
        location.reload();
    }
}
