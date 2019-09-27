<template>
    <div>
        <div class="section" data-title="Snow">
            <Slider :min="100" :max="10000" v-model="snowNumber">Amount</Slider>
        </div>
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
export default class EffectsSettings extends Vue {
    static title = 'EFFECTS';

    @Prop() readonly configModule!: ConfigModule;

    snowNumber = this.configModule.getConfig('snow.number', 0);

    @Watch('snowNumber')
    snowNumberChanged(value: any) {
        this.configModule.setConfig('snow.number', value);
    }
}
</script>

<style scoped lang="stylus">

</style>
