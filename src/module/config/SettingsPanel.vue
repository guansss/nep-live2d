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
            <div class="selectable right">
                <div class="close"></div>
            </div>
        </div>

        <component :is="currentPage" />
    </div>
</template>

<script lang="ts" src="./SettingsPanel.ts"></script>

<style scoped lang="stylus">
$themeColor = #333
$backgroundColor = #FFFFFFCC

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
</style>
