<template>
    <div :class="['switch', { checked: value }]">
        <div class="label">
            <slot />
        </div>
        <div class="track" @click="click">
            <div class="thumb"></div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Model } from 'vue-property-decorator';

@Component
export default class ToggleSwitch extends Vue {
    @Model('change', { default: false }) readonly value!: boolean;

    click() {
        this.$emit('change', !this.value);
    }
}
</script>

<style scoped lang="stylus">
@require './styles'

$height = 20px

.switch
    display flex
    width 240px
    padding 16px
    align-items center

.label
    width 30%

.track
    position relative
    margin-left auto
    width $height * 2
    height $height
    background-color #0001
    transition background-color .1s

    &:hover
        background-color #0002

.thumb
    position absolute
    top 0
    left 0
    width $height
    height $height
    background #999
    transition left .15s ease-out, background-color .15s ease-out

.checked
    .thumb
        left "calc(100% - %s)" % $height
        background-color var(--accentColor)
</style>
