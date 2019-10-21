<template>
    <div :class="['container', toBottom ? 'bottom' : 'top']">
        <TransitionGroup name="subtitle">
            <div v-for="subtitle in displaySubtitles" class="subtitle-item" :key="subtitle.id">
                <div class="subtitle bordered" :style="subtitle.sub.style">{{ subtitle.sub.text }}</div>
            </div>
        </TransitionGroup>
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
    margin 8px

.top
    top 0

.bottom
    bottom 0

.subtitle-item
    position relative
    padding 8px 48px
    text-align center

.subtitle
    position relative
    z-index 100
    display inline-block

    &.bordered
        padding 4px 8px
        border 1px solid white
        border-radius 2px
        background #AE2839
        color white
        font-size 1.5em

// animation

.subtitle-enter-active
.subtitle-leave-active
.subtitle-move
    transition transform .2s ease-out, opacity .2s ease-out

.subtitle-enter
.subtitle-leave-to
    opacity 0

.top .subtitle-enter
.bottom .subtitle-leave-to
    transform translateY(10px)

.top .subtitle-leave-to
.bottom .subtitle-enter
    transform translateY(-10px)

.subtitle-leave-active
    position absolute
    width 100%
</style>
