<template>
    <div class="page">
        <div class="section" data-title="Snow">
            <Slider :min="100" :max="10000" v-model="snowNumber">Amount</Slider>
        </div>
    </div>
</template>

<script lang="ts">
import Slider from '@/module/config/reusable/Slider.vue';
import SettingsPanel from '@/module/config/SettingsPanel.ts';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

@Component({
    components: { Slider },
})
export default class EffectsSettings extends Vue {
    static title = 'EFFECTS';

    snowNumber = this.configModule.getConfig('snow.number', 0);

    get configModule() {
        return (this.$parent as SettingsPanel).configModule();
    }

    @Watch('snowNumber')
    snowNumberChanged(value: any) {
        this.configModule.setConfig('snow.number', value);
    }
}
</script>

<style scoped lang="stylus">

</style>
