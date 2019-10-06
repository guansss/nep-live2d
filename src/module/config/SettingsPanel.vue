<template>
    <div ref="settings" :class="['settings', stateClass, { snapped }]" :style="panelStyle">
        <div v-if="expanded" ref="content" class="content">
            <div class="toolbar" ref="toolbar">
                <div class="tabs">
                    <div
                        v-for="(page, i) in pages"
                        :key="page.title"
                        :class="['tab selectable', { selected: i === selectedPage }]"
                        @click="selectPage(i)"
                    >
                        {{ page.title }}
                    </div>
                </div>
                <div class="selectable right" @click="refresh">
                    <div class="refresh"></div>
                </div>
                <div class="selectable" @click="close">
                    <div class="close"></div>
                </div>
            </div>

            <Scrollable class="page">
                <keep-alive>
                    <component :is="currentPage" ref="page" v-bind="{ configModule: cachedConfigModule }" />
                </keep-alive>
            </Scrollable>

            <div ref="resizer" class="resizer"></div>
        </div>
    </div>
</template>

<script lang="ts" src="./SettingsPanel.ts"></script>

<style scoped lang="stylus">
@require './reusable/vars'

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
    height 36px
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

.tabs
    display flex

.tab
    z-index 1
    padding 0 16px
    line-height 36px

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

// icons

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
