<template>
    <div ref="settings" :class="['settings', stateClass, { snapped }]" :style="panelStyle">
        <div v-if="expanded" ref="content" class="content">
            <div class="toolbar">
                <div class="tabs" ref="tabs">
                    <div
                        v-for="(page, i) in pages"
                        :key="page.title"
                        :class="['tab icon selectable', { selected: i === selectedPage }]"
                        @click="selectPage(i)"
                    >
                        <component :is="page.ICON" class="svg" />
                        <div class="title">{{ page.TITLE }}</div>
                    </div>
                </div>
                <div class="selectable icon" @click.stop="close">
                    <CloseSVG />
                </div>
            </div>

            <Scrollable class="page">
                <keep-alive>
                    <component :is="currentPage" ref="page" v-bind="{ configModule: _configModule }" />
                </keep-alive>
            </Scrollable>

            <div ref="resizer" class="resizer"></div>
        </div>
    </div>
</template>

<script lang="ts" src="./SettingsPanel.ts"></script>

<style scoped lang="stylus">
@require './reusable/vars'

$toolbarHeight = 32px

.settings
    position absolute
    max-width 100%
    max-height 100%
    overflow hidden
    user-select none
    color $themeColor
    font-size 16px
    background-color $backgroundColor
    box-shadow 0 0 2px #BBB
    transition background-color .2s

.switch
    transition transform .2s ease-out, opacity .2s ease-out
    transition-delay .8s

    &.snapped
        opacity 0

    &:hover
        opacity 1
        transform none !important
        transition-delay 0s

.content
    position relative
    display flex
    flex-direction column
    width 100%
    height 100%

.selectable
    cursor pointer
    transition background-color .15s, color .15s

    &.selected
        color #FFF
        background-color $themeColor !important
        cursor default

    &:hover
        background-color rgba($themeColor, 0.2)

.toolbar
    position relative
    display flex
    overflow hidden
    background-color rgba($themeColor, 0.1)
    cursor move

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

.icon
    width $toolbarHeight
    height $toolbarHeight
    padding 4px

    svg
        width $toolbarHeight - 2 * 4px
        height $toolbarHeight - 2 * 4px

    path
        fill currentColor

.tabs
    display flex
    flex-grow 1
    width 0

.tab
    z-index 1
    display flex
    width auto
    align-items center
    overflow hidden
    white-space nowrap

    &:first-child
        padding-left 14px

    &.selected
        .title
            max-width 8 * 12px
            opacity 1

    .title
        margin-left 2px
        max-width 0
        opacity 0
        font-size 12px
        transition max-width .1s linear, opacity .1s ease-out

.resizer
    $size = 12px
    position absolute
    bottom - $size
    right - $size
    border-top solid $size transparent
    border-right solid $size transparent
    border-bottom solid $size transparent
    border-left solid $size #FFF
    cursor se-resize
    transform rotate(45deg)
    transition border-left-color .15s ease-out

    &:hover
        border-left solid $size var(--accentColor)

// page content

.page
    flex 1 0 0
    width 100%

.settings >>> .section

    &:before
        content attr(data-title)
        display block
        padding 2px 16px
        background lighten($themeColor, 40%)
        color white
</style>
