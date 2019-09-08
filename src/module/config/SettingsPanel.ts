import { movable } from '@/core/utils/dom';
import GeneralSettings from '@/module/config/GeneralSettings.vue';
import ConfigModule from '@/module/config/index';
import { Component, Ref, Vue } from 'vue-property-decorator';

@Component
export default class SettingsPanel extends Vue {
    @Ref('panel') readonly panel!: HTMLDivElement;
    @Ref('toolbar') readonly toolbar!: HTMLDivElement;

    readonly tabs = ['General'];
    readonly pages = [GeneralSettings];

    selectedTab = 0;

    configModule!: ConfigModule;

    get currentPage() {
        return this.pages[this.selectedTab];
    }

    private mounted() {
        // TODO: use theme color from Wallpaper Engine properties
        document.documentElement.style.setProperty('--accentColor', '#AB47BC');

        this.panel.style.left = this.configModule.getConfig('settings.positionX', this.panel.style.left);
        this.panel.style.top = this.configModule.getConfig('settings.positionY', this.panel.style.top);

        this.setupDragging();
    }

    private setupDragging() {
        movable(this.toolbar, this.panel, {
            end: (e: MouseEvent) => {
                if (this.configModule) {
                    this.configModule.setConfig('settings.positionX', this.panel.style.left);
                    this.configModule.setConfig('settings.positionY', this.panel.style.top);
                }
            },
        });
    }

    refresh() {
        location.reload();
    }
}
