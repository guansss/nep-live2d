import { VueConstructor } from 'vue';
import { Component, Ref, Vue } from 'vue-property-decorator';

const DEFAULT_OPTIONS = {
    tab: 'General',
};

@Component
export default class Settings extends Vue {
    @Ref('settings') readonly settingsRef!: Vue[];

    readonly settings: VueConstructor[] = [];

    async addSetting(componentClass: VueConstructor) {
        const index = this.settings.length;
        this.settings.push(componentClass);

        await this.$nextTick();
        return this.settingsRef[index];
    }
}
