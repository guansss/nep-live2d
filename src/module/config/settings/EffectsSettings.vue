<template>
    <div>
        <div class="section" :data-title="$t('overall')">
            <ToggleSwitch config="hq" v-model="hq">{{ $t('high_quality') }}</ToggleSwitch>
        </div>
        <div class="section" :data-title="$t('leaves')">
            <ToggleSwitch config="leaves.on" v-model="leavesEnabled">{{ $t('enabled') }}</ToggleSwitch>
            <Slider int :min="leavesNumberMin" :max="leavesNumberMax" config="leaves.number" v-model="leavesNumber">
                {{ $t('amount') }}
            </Slider>
        </div>
        <div class="section" :data-title="$t('snow')">
            <ToggleSwitch config="snow.on" v-model="snowEnabled">{{ $t('enabled') }}</ToggleSwitch>
            <Slider int :min="snowNumberMin" :max="snowNumberMax" config="snow.number" v-model="snowNumber">
                {{ $t('amount') }}
            </Slider>
        </div>
    </div>
</template>

<script lang="ts">
import FlareSVG from '@/assets/img/flare.svg';
import {
    LEAVES_NUMBER,
    LEAVES_NUMBER_MAX,
    LEAVES_NUMBER_MIN,
    SNOW_NUMBER,
    SNOW_NUMBER_MAX,
    SNOW_NUMBER_MIN,
} from '@/defaults';
import ConfigModule from '@/module/config/ConfigModule';
import Slider from '@/module/config/reusable/Slider.vue';
import ToggleSwitch from '@/module/config/reusable/ToggleSwitch.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
    components: { ToggleSwitch, Slider },
})
export default class EffectsSettings extends Vue {
    static readonly ICON = FlareSVG;
    static readonly TITLE = 'effect';

    @Prop() readonly configModule!: ConfigModule;

    hq = true;

    snowEnabled = false;
    snowNumber = SNOW_NUMBER;
    snowNumberMin = SNOW_NUMBER_MIN;
    snowNumberMax = SNOW_NUMBER_MAX;

    leavesEnabled = false;
    leavesNumber = LEAVES_NUMBER;
    leavesNumberMin = LEAVES_NUMBER_MIN;
    leavesNumberMax = LEAVES_NUMBER_MAX;
}
</script>

<style scoped lang="stylus"></style>
