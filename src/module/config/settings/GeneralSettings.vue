<template>
    <div>
        <Slider progress v-model="volume">Volume</Slider>
    </div>
</template>

<script lang="ts">
import ConfigModule from '@/module/config/ConfigModule';
import Slider from '@/module/config/reusable/Slider.vue';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    components: { Slider },
})
export default class GeneralSettings extends Vue {
    static title = 'GENERAL';

    @Prop() readonly configModule!: ConfigModule;

    volume = this.configModule.getConfig('volume', 0);

    @Watch('volume')
    volumeChanged(value: any) {
        this.configModule.setConfig('volume', value);
    }
}
</script>

<style scoped lang="stylus">

</style>
