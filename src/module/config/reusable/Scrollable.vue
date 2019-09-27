<template>
    <div :class="['scrollable', { overflow }]">
        <div ref="container" class="container">
            <slot />
        </div>

        <div :class="['scrollbar', { dragging }]">
            <div ref="thumb" class="thumb" :style="thumbStyle" title="No mouse wheel scroll in browser :("></div>
        </div>
    </div>
</template>

<script lang="ts">
import Draggable from '@/core/utils/Draggable';
import { clamp } from '@/core/utils/math';
import Vue from 'vue';
import { Component, Ref } from 'vue-property-decorator';

// make our own scrollbar because default one works terrible in Wallpaper Engine

@Component
export default class Scrollable extends Vue {
    @Ref('container') readonly container!: HTMLDivElement;
    @Ref('thumb') readonly thumb!: HTMLDivElement;

    overflow = false;
    dragging = false;

    scrollTop = 0;

    barTop = 0;
    barHeight = 0;

    draggable!: Draggable;
    intervalId = -1;

    get thumbStyle() {
        return {
            top: this.barTop + 'px',
            height: this.barHeight + 'px',
        };
    }

    private mounted() {
        this.intervalId = window.setInterval(() => {
            this.overflow = this.container.offsetHeight < this.container.scrollHeight;

            if (this.overflow) {
                this.barHeight = this.container.offsetHeight ** 2 / this.container.scrollHeight || 0;
            }
        }, 500);

        this.draggable = new Draggable(this.thumb);

        this.draggable.onStart = () => {
            if (this.overflow) {
                this.dragging = true;
                return true;
            }
            return false;
        };

        this.draggable.onDrag = (e: MouseEvent) => {
            this.barTop = clamp(this.barTop + e._movementY, 0, this.container.offsetHeight - this.barHeight);

            this.scrollTop =
                this.barTop *
                ((this.container.scrollHeight - this.container.offsetHeight) /
                    (this.container.offsetHeight - this.barHeight));

            this.container.scrollTo({ top: this.scrollTop });

            return true;
        };

        this.draggable.onEnd = () => (this.dragging = false);
    }

    private beforeDestroy() {
        clearInterval(this.intervalId);
        this.draggable && this.draggable.release();
    }
}
</script>

<style scoped lang="stylus">
$barWidth = 12px

.scrollable
    position relative
    overflow hidden

.scrollbar
    position absolute
    top 0
    right 0
    bottom 0
    width $barWidth
    background #0002
    opacity 0
    transition opacity .15s ease-out
    transition-delay 1s

.overflow
    .dragging, .scrollbar:hover
        opacity 1
        transition-delay 0s

.thumb
    position absolute
    width $barWidth
    background #0006

.container
    position relative
    width 100%
    height 100%
    overflow hidden
</style>
