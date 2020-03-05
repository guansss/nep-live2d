import CloseSVG from '@/assets/img/close.svg';
import RefreshSVG from '@/assets/img/refresh.svg';
import { nop } from '@/core/utils/misc';
import { I18N, LOCALE } from '@/defaults';
import ConfigModule from '@/module/config/ConfigModule';
import FloatingPanelMixin from '@/module/config/FloatingPanelMixin';
import Scrollable from '@/module/config/reusable/Scrollable.vue';
import AboutSettings from '@/module/config/settings/AboutSettings.vue';
import BackgroundSettings from '@/module/config/settings/BackgroundSettings.vue';
import CharacterSettings from '@/module/config/settings/CharacterSettings.vue';
import ConsoleSettings from '@/module/config/settings/ConsoleSettings.vue';
import EffectsSettings from '@/module/config/settings/EffectsSettings.vue';
import GeneralSettings from '@/module/config/settings/GeneralSettings.vue';
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator';
import { Vue } from 'vue/types/vue';

@Component({
    components: { CloseSVG, RefreshSVG, Scrollable },
})
export default class SettingsPanel extends Mixins(FloatingPanelMixin) {
    @Prop() readonly module!: () => ConfigModule;

    @Ref('settings') readonly panel!: HTMLDivElement;
    @Ref('content') readonly content!: HTMLDivElement;
    @Ref('tabs') readonly handle!: HTMLDivElement;
    @Ref('resizer') readonly resizer!: HTMLDivElement;
    @Ref('page') readonly pageComponent!: Vue;

    get configModule() {
        return this.module();
    }

    readonly pages = [
        GeneralSettings,
        CharacterSettings,
        BackgroundSettings,
        EffectsSettings,
        ConsoleSettings,
        AboutSettings,
    ];

    selectedPage = 0;

    title? = '';

    get currentPage() {
        return this.pages[this.selectedPage];
    }

    dialog = {
        visible: false,
        message: '',
        confirm: '',
        cancel: '',
        onFinish: nop as (confirmed: boolean, canceled: boolean) => boolean | undefined,
    };

    created() {
        this.switchTop = this.configModule.getConfig('settings.switchTop', this.switchTop);
        this.switchLeft = this.configModule.getConfig('settings.switchLeft', this.switchLeft);

        this.panelTop = this.configModule.getConfig('settings.panelTop', this.panelTop);
        this.panelLeft = this.configModule.getConfig('settings.panelLeft', this.panelLeft);
        this.panelWidth = this.configModule.getConfig('settings.panelWidth', this.panelWidth);
        this.panelHeight = this.configModule.getConfig('settings.panelHeight', this.panelHeight);
    }

    mounted() {
        this.configModule.app
            .once('init', (prevVersion?: string) => {
                if (!prevVersion) {
                    // show tip at first launch
                    this.title = process.env.NAME;
                } else if (I18N[LOCALE]['changelog_important']) {
                    this.selectPage(this.pages.indexOf(AboutSettings));
                    this.open();
                }
            })
            .on('we:switch', this.toggle, this);
    }

    toggle(_: boolean, initial?: boolean) {
        if (!initial) {
            this.expanded ? this.close() : this.open();
        }
    }

    selectPage(index: number) {
        this.selectedPage = index;
    }

    refresh() {
        this.configModule.app.emit('reload');
    }

    showDialog(
        message: string,
        confirm?: string,
        cancel?: string,
        onFinish?: (confirmed: boolean, canceled: boolean) => boolean | undefined,
    ) {
        this.dialog.visible = true;
        this.dialog.message = message;
        this.dialog.confirm = confirm || (this.$t('confirm') as string);
        this.dialog.cancel = cancel || (this.$t('cancel') as string);
        this.dialog.onFinish = onFinish || nop;
    }

    switchMoveEnded() {
        this.configModule.setConfig('settings.switchTop', this.switchTop);
        this.configModule.setConfig('settings.switchLeft', this.switchLeft);
    }

    panelMoveEnded() {
        this.configModule.setConfig('settings.panelTop', this.panelTop);
        this.configModule.setConfig('settings.panelLeft', this.panelLeft);
    }

    panelResizeEnded() {
        this.configModule.setConfig('settings.panelWidth', this.panelWidth);
        this.configModule.setConfig('settings.panelHeight', this.panelHeight);
    }

    beforeDestroy() {
        this.configModule.app.off('we:switch', this.toggle);
    }
}
