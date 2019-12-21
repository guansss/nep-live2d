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
import ConfigBindingMixin from '@/module/config/reusable/ConfigBindingMixin';
import { Component, Mixins, Model } from 'vue-property-decorator';

@Component
export default class ToggleSwitch extends Mixins(ConfigBindingMixin) {
    @Model('change', { default: false }) readonly value!: boolean;

    click() {
        this.updateValue(!this.value);
    }
}
</script>

<style scoped lang="stylus">
@require './vars'

$height = 20px

.switch
    display flex
    width 240px
    padding 12px 16px
    align-items center

.track
    position relative
    width $height * 2
    height $height
    background-color #0001
    box-shadow inset 0 0 4px #0002
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
    box-shadow 0 0 5px 0 rgba(0, 0, 0, 0.3)
    transition left .15s ease-out, background-color .15s ease-out

.checked
    .thumb
        left "calc(100% - %s)" % $height
        background-color var(--accentColor)
</style>
