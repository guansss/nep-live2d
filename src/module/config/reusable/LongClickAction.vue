<template>
    <div class="long-click">
        <div
            :class="{ cover: !$slots.control }"
            @click.stop=""
            @mousedown.stop="start"
            @mouseup.stop="cancel"
            @mouseleave="cancel"
        >
            <slot name="control" />
        </div>
        <div class="progress" :style="{ transform: `translateY(${(1 - progress) * 100}%)` }"></div>
        <slot />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class LongClickAction extends Vue {
    @Prop({ type: Number, default: 1000 }) duration!: number;

    progress = 0; // 0 ~ 1
    rafID = -1;

    start() {
        // ensure there is no active animation
        if (this.rafID === -1) {
            this.progress = 0;

            const startTime = performance.now();

            // make animation
            const tick = (now: DOMHighResTimeStamp) => {
                this.progress = (now - startTime) / this.duration;

                if (this.progress > 1) {
                    this.rafID = -1;
                    this.action();
                } else {
                    this.rafID = requestAnimationFrame(tick);
                }
            };

            tick(startTime);
        }
    }

    cancel() {
        this.progress = 0;

        if (this.rafID !== -1) cancelAnimationFrame(this.rafID);
        this.rafID = -1;
    }

    action() {
        this.$emit('long-click');

        // this method can also be used to clean up
        this.cancel();
    }

    beforeDestroy() {
        this.cancel();
    }
}
</script>

<style scoped lang="stylus">
.long-click
    position relative
    overflow hidden

.cover
.progress
    position absolute
    top 0
    left 0
    width 100%
    height 100%

.progress
    background #0002
    pointer-events none
</style>
