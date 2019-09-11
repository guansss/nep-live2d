<template>
    <div class="page">
        <Slider progress v-model="volume">Volume</Slider>
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
export default class GeneralSettings extends Vue {
    volume = this.configModule.getConfig('volume', 0);

    get configModule() {
        return (this.$parent as SettingsPanel).configModule();
    }

    @Watch('volume')
    volumeChanged(value: any) {
        this.configModule.setConfig('volume', value);
    }
}
</script>

<style scoped lang="stylus">

</style>
