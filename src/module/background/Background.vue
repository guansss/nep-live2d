<template>
    <video autoplay loop v-show="visible" ref="vid" class="vid" :style="{ objectFit: fill ? 'fill' : 'cover' }"></video>
</template>

<script lang="ts">
import { nop } from '@/core/utils/misc';
import BackgroundModule from '@/module/background/BackgroundModule';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';

@Component
export default class Background extends Vue {
    @Prop() readonly module!: () => BackgroundModule;

    @Ref('vid') readonly video!: HTMLVideoElement;

    get bgModule() {
        return this.module();
    }

    visible = true;
    fill = false;

    created() {
        this.bgModule.applyVideo = (url?: string) => this.setVideo(url);
        this.bgModule.applyVolume = (volume: number) => (this.video.volume = volume);
        this.bgModule.fillVideo = (fill: boolean) => (this.fill = fill);
    }

    setVideo(src?: string) {
        this.video.src = src || '';
        this.visible = !!src;
    }

    beforeDestroy() {
        this.bgModule.applyVideo = nop;
        this.bgModule.applyVolume = nop;
        this.bgModule.fillVideo = nop;
    }
}
</script>

<style lang="stylus">
#canvas
    z-index 1
</style>

<style scoped lang="stylus">
.vid
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    background #333
</style>
