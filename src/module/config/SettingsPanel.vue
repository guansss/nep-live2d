<template>
    <div ref="settings" :class="['settings', stateClass, { snapped }]" :style="panelStyle" @mousedown.stop="">
        <div v-if="expanded" ref="content" class="content">
            <div class="toolbar">
                <div class="tabs" ref="tabs">
                    <div
                        v-for="(page, i) in pages"
                        :key="page.title"
                        :class="['tab icon selectable', { selected: i === selectedPage }]"
                        :data-title="$t(page.TITLE)"
                        @click="selectPage(i)"
                    >
                        <component :is="page.ICON" class="svg" />
                    </div>
                </div>
                <div class="selectable icon" @click.stop="close">
                    <CloseSVG />
                </div>
            </div>

            <Scrollable class="page">
                <transition name="fade" mode="out-in">
                    <keep-alive>
                        <component
                            :is="currentPage"
                            ref="page"
                            v-bind="{ configModule, contentVisible }"
                            @dialog="showDialog"
                        />
                    </keep-alive>
                </transition>

                <transition name="fade">
                    <div
                        v-if="dialog.visible"
                        class="dialog-bg"
                        @click="dialog.onFinish(false, false) || (dialog.visible = false)"
                    >
                        <div class="dialog" @click.stop="">
                            <div class="msg">{{ dialog.message }}</div>
                            <div class="cancel" @click="dialog.onFinish(false, true) || (dialog.visible = false)">
                                {{ dialog.cancel }}
                            </div>
                            <div class="confirm" @click="dialog.onFinish(true, false) || (dialog.visible = false)">
                                {{ dialog.confirm }}
                            </div>
                        </div>
                    </div>
                </transition>
            </Scrollable>

            <div ref="resizer" class="resizer"></div>
        </div>
    </div>
</template>

<script lang="ts" src="./SettingsPanel.ts"></script>

<style scoped lang="stylus">
@require './reusable/vars'

$toolbarHeight = 36px

.settings
    @extend $card
    position absolute
    z-index 1000
    max-width 100%
    max-height 100%
    overflow visible
    user-select none
    color $themeColor
    font-size 16px
    background-color $backgroundColor

    >>> .button
        position relative
        display inline-block
        margin-bottom 8px
        padding 8px 16px
        background $themeColor
        color #FFF
        font-size 14px
        cursor pointer
        box-shadow 0 1px 2px #0004
        transition background-color .15s ease-out, color .15s ease-out, box-shadow .15s ease-out

        &:hover
            background darken($themeColor, 30%)
            box-shadow 0 2px 4px #0006

        &:active
            box-shadow 0 1px 2px #0002

        .svg
            width 16px
            height 16px
            vertical-align middle

            path
                fill currentColor

    >>> .button-group
        display flex
        flex-wrap wrap

        .button
            background #EEE
            color #333

            &:hover
                background #CCC

            &.active
                background $themeColor
                color #FFF

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

    >>> .switch
    >>> .slider
    >>> .select
        width 100%

    >>> .label
        width 160px

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
    $svgSize = 24px
    padding 6px 12px

    svg
        display block
        width $svgSize
        height $svgSize

    path
        fill currentColor

.tabs
    display flex
    flex-grow 1
    width 0

.tab
    position relative
    flex-shrink 1
    min-width 0
    z-index 1

    &:before
        content ''
        position absolute
        top -6px
        left 50%
        opacity 0
        border-left 6px solid transparent
        border-right 6px solid transparent
        border-top 6px solid #333
        transform translateX(-50%)
        transition opacity .15s ease-out

    &:after
        content attr(data-title)
        position absolute
        display block
        bottom calc(100% + 6px)
        left 50%
        padding 6px
        opacity 0
        background #333
        color #FFF
        font-size 14px
        word-break keep-all
        text-transform uppercase
        border-radius 2px
        transform translateX(-50%)
        transition opacity .15s

    &:hover
        &:before, &:after
            opacity 1

.resizer
    $size = 12px
    position absolute
    bottom - $size
    right - $size
    border-top solid $size transparent
    border-right solid $size transparent
    border-bottom solid $size transparent
    border-left solid $size #DDD
    cursor se-resize
    transform rotate(45deg)
    transition border-left-color .15s ease-out

    &:hover
        border-left solid $size #999

// dialog

.dialog-bg
    position absolute
    z-index 1000
    top 0
    right 0
    bottom 0
    left 0
    background #0004

.dialog
    position absolute
    top 50%
    right 0
    left 0
    background #F0F0F0
    box-shadow 0 3px 10px #0008, 0 1px 3px #0004
    transform translateY(-50%)

.msg
    padding 16px
    text-align center
    white-space pre-wrap
    line-height 20px

.confirm
.cancel
    position relative
    display inline-block
    width 50%
    padding 0 16px
    color #FFF
    font-size 14px
    text-transform uppercase
    line-height 36px
    cursor pointer
    transition background-color .15s ease-out

    &:before
        content ''
        position absolute
        top 0
        right 0
        bottom 0
        left 0
        background transparent
        will-change background-color
        transition background-color .15s ease-out

    &:hover:before
        background #0002

.cancel
    left 0
    background #666
    text-align right

.confirm
    right 0
    background var(--accentColor)
    text-align left

// page content

.page
    flex 1 0 0
    width 100%

.settings >>> .section
    &[data-title]:before
        content attr(data-title)
        display inline-block
        margin 8px 0
        padding 4px 8px 4px 16px
        background lighten($themeColor, 30%)
        color #FFF
        font-size 12px
        line-height 1.2

    &:not(:last-child):after
        content ''
        display block
        margin-top 8px
        height 8px
        background #0001
        box-shadow inset 0 0 4px #0001

// animation

.fade-enter-active
    transition opacity .15s

.fade-leave-active
    transition opacity .05s

.fade-enter, .fade-leave-to
    opacity 0
</style>
