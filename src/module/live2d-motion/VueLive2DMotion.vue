<template>
    <div :class="['container', toBottom ? 'bottom' : 'top']">
        <template v-for="subtitle in displaySubtitles">
            <div class="subtitle-wrapper" :key="subtitle.id">
                <div class="subtitle bordered" :style="subtitle.sub.style">{{ subtitle.sub.text }}</div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import Live2DMotionModule from '@/module/live2d-motion/Live2DMotionModule';
import { Subtitle } from '@/module/live2d-motion/SubtitleManager';
import { Component, Prop, Vue } from 'vue-property-decorator';

let _id = 1;

@Component
export default class VueLive2DMotion extends Vue {
    @Prop() readonly module!: () => Live2DMotionModule;

    subtitles: { id: number; sub: Subtitle }[] = [];

    toBottom = false;

    get displaySubtitles() {
        return this.toBottom ? this.subtitles.slice().reverse() : this.subtitles;
    }

    get live2DMotionModule() {
        return this.module();
    }

    created() {
        this.live2DMotionModule.app
            .on('config:sub.bottom', (bottom: boolean) => (this.toBottom = bottom))
            .on('configReady', () => this.live2DMotionModule.app.emit('config', 'sub.bottom', this.toBottom, true));

        this.live2DMotionModule.subtitleManager.show = (subtitle: Subtitle) => this.show(subtitle);
        this.live2DMotionModule.subtitleManager.dismiss = (id: number) => this.dismiss(id);
    }

    show(subtitle: Subtitle) {
        const id = _id++;
        this.subtitles.push({ id, sub: subtitle });

        return id;
    }

    dismiss(id: number) {
        const index = this.subtitles.findIndex(it => it.id === id);

        if (index !== -1) this.subtitles.splice(index, 1);
    }
}
</script>

<style scoped lang="stylus">
.container
    position absolute
    right 0
    left 0

.top
    top 0

.bottom
    bottom 0

.subtitle-wrapper
    margin 16px 64px

.subtitle
    position relative
    left 50%
    margin 0 auto
    z-index 1000
    display inline-block
    transform translateX(-50%)

    &.bordered
        padding 4px 8px
        border 1px solid white
        border-radius 2px
        background #AE2839
        color white
        font-size 1.5em
</style>
