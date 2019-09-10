import FloatingPanelMixin from '@/module/config/FloatingPanelMixin';
import FloatingSwitch from '@/module/config/FloatingSwitch.vue';
import GeneralSettings from '@/module/config/GeneralSettings.vue';
import ConfigModule from '@/module/config/index';
import { Component, Mixins, Ref } from 'vue-property-decorator';

@Component({
    components: { FloatingSwitch },
})
export default class SettingsPanel extends Mixins(FloatingPanelMixin) {
    @Ref('settings') readonly panel!: HTMLDivElement;
    @Ref('content') readonly content!: HTMLDivElement;
    @Ref('toolbar') readonly handle!: HTMLDivElement;

    readonly tabs = ['General'];
    readonly pages = [GeneralSettings];

    selectedTab = 0;

    configModule!: ConfigModule;

    get currentPage() {
        return this.pages[this.selectedTab];
    }

    protected mounted() {
        // TODO: use theme color from Wallpaper Engine properties
        document.documentElement.style.setProperty('--accentColor', '#AB47BC');

        this.switchTop = this.configModule.getConfig('settings.switchTop', this.switchTop);
        this.switchLeft = this.configModule.getConfig('settings.switchLeft', this.switchLeft);

        this.panelTop = this.configModule.getConfig('settings.panelTop', this.panelTop);
        this.panelLeft = this.configModule.getConfig('settings.panelLeft', this.panelLeft);
    }

    protected switchMoveEnded() {
        this.configModule.setConfig('settings.switchTop', this.switchTop);
        this.configModule.setConfig('settings.switchLeft', this.switchLeft);
    }

    protected panelMoveEnded() {
        this.configModule.setConfig('settings.panelTop', this.panelTop);
        this.configModule.setConfig('settings.panelLeft', this.panelLeft);
    }

    refresh() {
        location.reload();
    }
}
