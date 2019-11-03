<template>
    <div>
        <div class="section" data-title="Leaves">
            <ToggleSwitch v-model="leavesEnabled">Enabled</ToggleSwitch>
            <Slider :min="leavesNumberMin" :max="leavesNumberMax" v-model="leavesNumber">Amount</Slider>
        </div>
        <div class="section" data-title="Snow">
            <ToggleSwitch v-model="snowEnabled">Enabled</ToggleSwitch>
            <Slider :min="snowNumberMin" :max="snowNumberMax" v-model="snowNumber">Amount</Slider>
        </div>
    </div>
</template>

<script lang="ts">
import FlareSVG from '@/assets/img/flare.svg';
import { LEAVES_NUMBER_MAX, LEAVES_NUMBER_MIN, SNOW_NUMBER_MAX, SNOW_NUMBER_MIN } from '@/defaults';
import ConfigModule from '@/module/config/ConfigModule';
import Slider from '@/module/config/reusable/Slider.vue';
import ToggleSwitch from '@/module/config/reusable/ToggleSwitch.vue';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    components: { ToggleSwitch, Slider },
})
export default class EffectsSettings extends Vue {
    static readonly ICON = FlareSVG;
    static readonly TITLE = 'effect';

    @Prop() readonly configModule!: ConfigModule;

    snowEnabled = this.configModule.getConfig('snow.enabled', false);
    snowNumber = this.configModule.getConfig('snow.number', 0);
    snowNumberMin = SNOW_NUMBER_MIN;
    snowNumberMax = SNOW_NUMBER_MAX;

    leavesEnabled = this.configModule.getConfig('leaves.enabled', false);
    leavesNumber = this.configModule.getConfig('leaves.number', 0);
    leavesNumberMin = LEAVES_NUMBER_MIN;
    leavesNumberMax = LEAVES_NUMBER_MAX;

    @Watch('snowEnabled')
    snowEnabledChanged(value: boolean) {
        this.configModule.setConfig('snow.enabled', value);
    }

    @Watch('snowNumber')
    snowNumberChanged(value: number) {
        this.configModule.setConfig('snow.number', ~~value);
    }

    @Watch('leavesEnabled')
    leavesEnabledChanged(value: boolean) {
        this.configModule.setConfig('leaves.enabled', value);
    }

    @Watch('leavesNumber')
    leavesNumberChanged(value: number) {
        this.configModule.setConfig('leaves.number', ~~value);
    }
}
</script>

<style scoped lang="stylus"></style>
