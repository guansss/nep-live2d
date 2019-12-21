<template>
    <div>
        <div class="section" :data-title="$t('leaves')">
            <ToggleSwitch config="leaves.enabled" v-model="leavesEnabled">{{ $t('enabled') }}</ToggleSwitch>
            <Slider int :min="leavesNumberMin" :max="leavesNumberMax" config="leaves.number" v-model="leavesNumber">
                {{ $t('amount') }}
            </Slider>
        </div>
        <div class="section" :data-title="$t('snow')">
            <ToggleSwitch config="snow.enabled" v-model="snowEnabled">{{ $t('enabled') }}</ToggleSwitch>
            <Slider int :min="snowNumberMin" :max="snowNumberMax" config="snow.number" v-model="snowNumber">
                {{ $t('amount') }}
            </Slider>
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
import { Component, Prop } from 'vue-property-decorator';

@Component({
    components: { ToggleSwitch, Slider },
})
export default class EffectsSettings extends Vue {
    static readonly ICON = FlareSVG;
    static readonly TITLE = 'effect';

    @Prop() readonly configModule!: ConfigModule;

    snowEnabled = false;
    snowNumber = 0;
    snowNumberMin = SNOW_NUMBER_MIN;
    snowNumberMax = SNOW_NUMBER_MAX;

    leavesEnabled = false;
    leavesNumber = 0;
    leavesNumberMin = LEAVES_NUMBER_MIN;
    leavesNumberMax = LEAVES_NUMBER_MAX;
}
</script>

<style scoped lang="stylus"></style>
