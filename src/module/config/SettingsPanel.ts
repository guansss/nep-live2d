import ConfigModule from '@/module/config/index';
import { Component, Ref, Vue } from 'vue-property-decorator';

@Component
export default class SettingsPanel extends Vue {
    @Ref('panel') readonly panel!: HTMLDivElement;
    @Ref('toolbar') readonly toolbar!: HTMLDivElement;

    readonly tabs = [];
    readonly pages = [];

    selectedTab = 0;

    configModule?: ConfigModule;

    toolbarPressed = false;

    lastMouseX!: number;
    lastMouseY!: number;

    get currentPage() {
        return this.pages[this.selectedTab];
    }

    private mounted() {
        this.setupDragging();
    }

    private setupDragging() {
        this.toolbar.addEventListener('mousedown', (e: MouseEvent) => {
            if (e.target === e.currentTarget) {
                this.toolbarPressed = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (this.toolbarPressed) {
                this.panel.style.left = this.panel.offsetLeft + e.clientX - this.lastMouseX + 'px';
                this.panel.style.top = this.panel.offsetTop + e.clientY - this.lastMouseY + 'px';
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });
        document.addEventListener('mouseup', () => {
            this.toolbarPressed = false;
            if (this.configModule) {
                this.configModule.setConfig('config.settings.positionX', this.panel.style.left);
                this.configModule.setConfig('config.settings.positionY', this.panel.style.top);
            }
        });
    }

    attachTo(configModule: ConfigModule) {
        this.configModule = configModule;
        this.panel.style.left = this.configModule.getConfig('config.settings.positionX', this.panel.style.left);
        this.panel.style.top = this.configModule.getConfig('config.settings.positionY', this.panel.style.top);
    }

    refresh() {
        location.reload();
    }
}
