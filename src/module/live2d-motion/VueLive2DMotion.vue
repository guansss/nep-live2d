<template>
    <div class="motion-container top">
        <template v-for="(subtitle, i) in subtitles">
            <div class="subtitle-wrapper" :key="i">
                <div class="subtitle bordered" :style="subtitle.style">{{ subtitle.text }}</div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import Live2DMotionModule from '@/module/live2d-motion/Live2DMotionModule';
import { Subtitle } from '@/module/live2d-motion/SubtitleManager';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class VueLive2DMotion extends Vue {
    @Prop() readonly module!: () => Live2DMotionModule;

    subtitles: Subtitle[] = [];

    get live2DMotionModule() {
        return this.module();
    }

    created() {
        this.live2DMotionModule.subtitleManager.show = (subtitle: Subtitle) => this.show(subtitle);
        this.live2DMotionModule.subtitleManager.dismiss = (index: number) => this.dismiss(index);
    }

    show(subtitle: Subtitle) {
        // return index
        return this.subtitles.push(subtitle) - 1;
    }

    dismiss(index: number) {
        this.subtitles.splice(index, 1);
    }
}
</script>

<style scoped lang="stylus">
.motion-container
    position absolute
    z-index 1000
    right 0
    left 0

    &.top
        top 0

    &.bottom
        bottom 0

.subtitle-wrapper
    margin-top 16px

.subtitle
    position relative
    left 50%
    margin 0 auto
    display inline-block
    transform translateX(-50%)

    &.bordered
        max-width 50%
        padding 4px 8px
        border 1px solid white
        border-radius 2px
        background #AE2839
        color white
        font-size 1.5em
</style>
