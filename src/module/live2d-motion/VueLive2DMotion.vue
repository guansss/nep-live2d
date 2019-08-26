<template>
    <div class="motion-container top">
        <template v-for="(subtitle, i) in subtitles">
            <div class="subtitle-wrapper" :key="i">
                <div class="subtitle bordered" :style="subtitle.style">{{ subtitle.text }}</div>
            </div>
        </template>
    </div>
</template>

<script lang="ts" src="./VueLive2DMotion.ts"></script>

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
