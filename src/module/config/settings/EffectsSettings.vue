<template>
    <div>
        <div class="section" data-title="Snow">
            <ToggleSwitch v-model="snowEnabled">Enabled</ToggleSwitch>
            <Slider :min="100" :max="10000" v-model="snowNumber">Amount</Slider>
        </div>
    </div>
</template>

<script lang="ts">
import FlowerSVG from '@/assets/img/flower.svg';
import defaults from '@/defaults';
import ConfigModule from '@/module/config/ConfigModule';
import Slider from '@/module/config/reusable/Slider.vue';
import ToggleSwitch from '@/module/config/reusable/ToggleSwitch.vue';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    components: { ToggleSwitch, Slider },
})
export default class EffectsSettings extends Vue {
    static readonly ICON = FlowerSVG;
    static readonly TITLE = 'EFFECTS';

    @Prop() readonly configModule!: ConfigModule;

    snowEnabled = this.configModule.getConfig('snow.enabled', defaults.SNOW_ENABLED);
    snowNumber = this.configModule.getConfig('snow.number', defaults.SNOW_NUMBER);

    @Watch('snowEnabled')
    snowEnabledChanged(value: boolean) {
        this.configModule.setConfig('snow.enabled', value);
    }

    @Watch('snowNumber')
    snowNumberChanged(value: number) {
        this.configModule.setConfig('snow.number', value);
    }
}
</script>

<style scoped lang="stylus">

</style>
