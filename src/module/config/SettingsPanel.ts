import CloseSVG from '@/assets/img/close.svg';
import ConfigModule from '@/module/config/ConfigModule';
import FloatingPanelMixin from '@/module/config/FloatingPanelMixin';
import Scrollable from '@/module/config/reusable/Scrollable.vue';
import BackgroundSettings from '@/module/config/settings/BackgroundSettings.vue';
import CharacterSettings from '@/module/config/settings/CharacterSettings.vue';
import ConsoleSettings from '@/module/config/settings/ConsoleSettings.vue';
import EffectsSettings from '@/module/config/settings/EffectsSettings.vue';
import GeneralSettings from '@/module/config/settings/GeneralSettings.vue';
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator';
import { Vue } from 'vue/types/vue';

@Component({
    components: { CloseSVG, Scrollable },
})
export default class SettingsPanel extends Mixins(FloatingPanelMixin) {
    // use getter function to prevent Vue's observation on ConfigModule instance
    @Prop() readonly configModule!: () => ConfigModule;

    @Ref('settings') readonly panel!: HTMLDivElement;
    @Ref('content') readonly content!: HTMLDivElement;
    @Ref('tabs') readonly handle!: HTMLDivElement;
    @Ref('resizer') readonly resizer!: HTMLDivElement;
    @Ref('page') readonly pageComponent!: Vue;

    readonly pages = [GeneralSettings, CharacterSettings, BackgroundSettings, EffectsSettings, ConsoleSettings];

    selectedPage = 0;

    get currentPage() {
        return this.pages[this.selectedPage];
    }

    get _configModule() {
        // cache ConfigModule so we don't need to call the getter function every time
        return this.configModule();
    }

    created() {
        this.switchTop = this._configModule.getConfig('settings.switchTop', this.switchTop);
        this.switchLeft = this._configModule.getConfig('settings.switchLeft', this.switchLeft);

        this.panelTop = this._configModule.getConfig('settings.panelTop', this.panelTop);
        this.panelLeft = this._configModule.getConfig('settings.panelLeft', this.panelLeft);
        this.panelWidth = this._configModule.getConfig('settings.panelWidth', this.panelWidth);
        this.panelHeight = this._configModule.getConfig('settings.panelHeight', this.panelHeight);
    }

    async selectPage(index: number) {
        this.selectedPage = index;
    }

    switchMoveEnded() {
        this._configModule.setConfig('settings.switchTop', this.switchTop);
        this._configModule.setConfig('settings.switchLeft', this.switchLeft);
    }

    panelMoveEnded() {
        this._configModule.setConfig('settings.panelTop', this.panelTop);
        this._configModule.setConfig('settings.panelLeft', this.panelLeft);
    }

    panelResizeEnded() {
        this._configModule.setConfig('settings.panelWidth', this.panelWidth);
        this._configModule.setConfig('settings.panelHeight', this.panelHeight);
    }
}
