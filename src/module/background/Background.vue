<template>
    <video autoplay loop v-show="visible" ref="vid" class="vid" :style="{ objectFit: fill ? 'fill' : 'cover' }"></video>
</template>

<script lang="ts">
import { clamp } from '@/core/utils/math';
import { nop } from '@/core/utils/misc';
import BackgroundModule from '@/module/background/BackgroundModule';
import Vue from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';

const VOLUME_FADE_DURATION = 500;

@Component
export default class Background extends Vue {
    @Prop() readonly module!: () => BackgroundModule;

    @Ref('vid') readonly video!: HTMLVideoElement;

    get bgModule() {
        return this.module();
    }

    visible = true;
    volume = 0;
    fill = false;

    intervalId = -1;

    created() {
        this.bgModule.applyVideo = (url?: string) => this.setVideo(url);
        this.bgModule.applyVolume = (volume: number) => (this.video.volume = this.volume = volume);
        this.bgModule.fillVideo = (fill: boolean) => (this.fill = fill);

        this.bgModule.app.on('pause', this.pause, this).on('resume', this.resume, this);
    }

    setVideo(src?: string) {
        this.video.src = src || '';
        this.visible = !!src;
    }

    pause() {
        this.fadeVolume(0).then(() => this.video.pause());
    }

    resume() {
        this.video.play();
        this.fadeVolume(this.volume);
    }

    async fadeVolume(value: number) {
        clearInterval(this.intervalId);

        let ticks = VOLUME_FADE_DURATION / 50;
        const step = (value - this.video.volume) / ticks;

        return new Promise(resolve => {
            this.intervalId = window.setInterval(() => {
                this.video.volume = clamp(this.video.volume + step, 0, 1);

                if (ticks-- <= 0) {
                    clearInterval(this.intervalId);
                    resolve();
                }
            }, 50);
        });
    }

    beforeDestroy() {
        clearInterval(this.intervalId);

        this.bgModule.applyVideo = nop;
        this.bgModule.applyVolume = nop;
        this.bgModule.fillVideo = nop;

        this.bgModule.app.off('pause', this.pause).off('resume', this.resume);
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
