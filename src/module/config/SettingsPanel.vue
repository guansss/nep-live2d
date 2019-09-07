<template>
    <div class="settings" ref="panel">
        <div class="toolbar" ref="toolbar">
            <div class="tabs">
                <div
                    v-for="(tab, i) in tabs"
                    :key="tab"
                    :class="['tab selectable', { selected: i === selectedTab }]"
                    @click="selectedTab = i"
                >
                    {{ tab }}
                </div>
            </div>
            <div class="selectable right" @click="refresh">
                <div class="refresh"></div>
            </div>
            <div class="selectable">
                <div class="close"></div>
            </div>
        </div>

        <component :is="currentPage" />
    </div>
</template>

<script lang="ts" src="./SettingsPanel.ts"></script>

<style scoped lang="stylus">
@require './reusable/vars'

.settings
    position absolute
    top 20vh
    left 20%
    width 100vh
    height 60vh
    max-width 100%
    max-height 100%
    overflow auto
    color $themeColor
    font-size 16px
    background-color $backgroundColor
    border-radius 4px
    box-shadow 0 0 2px #BBB

.selectable
    cursor pointer
    transition background-color .1s, color .1s

    &.selected
        color #EEE
        background-color $themeColor !important
        cursor default

    &:hover
        background-color rgba($themeColor, 0.2)

.toolbar
    position relative
    display flex
    background-color rgba($themeColor, 0.1)
    cursor move
    user-select none

    &:before
        content ''
        position absolute
        display block
        right 0
        bottom 0
        left 0
        height 1px
        background-color lighten($themeColor, 60%)

    .right
        margin-left auto

.tabs
    display flex

.tab
    z-index 1
    padding 8px 16px

.close
    position relative
    align-self end
    margin 6px 16px 0
    width 21px
    height 21px

    &:before
        content: '';
        position: absolute;
        top: 10px;
        width: 21px;
        height: 2px;
        background-color: currentColor;
        transform: rotate(-45deg);

    &:after
        content: '';
        position: absolute;
        top: 10px;
        width: 21px;
        height: 2px;
        background-color: currentColor;
        transform: rotate(45deg);

.refresh
    position relative
    margin 8px 16px 0
    width 18px
    height 18px
    border-radius 50%
    border-top solid 2px currentColor
    border-right solid 2px transparent
    border-bottom solid 2px currentColor
    border-left solid 2px currentColor
    transform rotate(22.5deg)

    &:before
        content ''
        position absolute
        top -2px
        left -2px
        width 14px
        height 14px
        border-radius 50%
        border-top solid 2px transparent
        border-right solid 2px transparent
        border-bottom solid 2px currentColor
        border-left solid 2px transparent
        transform-origin 50% 50%
        transform rotate(-60deg)

    &:after
        content ''
        position absolute
        left 10px
        top -2px
        width 0
        height 0
        border-top solid 4px transparent
        border-right solid 4px transparent
        border-bottom solid 4px transparent
        border-left solid 4px currentColor
        transform rotate(30deg)
</style>
