<template>
    <div class="about">
        <div class="headline">{{ title }}</div>
        <div class="subtitle">{{ $t('subtitle') }}</div>
        <div>
            <span class="badge">{{ ver }}</span>
            <span class="badge" data-title="/guansss/nep-live2d">Now on Github</span>
        </div>

        <div class="desc">{{ $t('desc') }}</div>

        <div class="credit">
            <div class="header">Credits</div>
            <div class="title">Live2D Models</div>
            <div class="list">MAINICHI COMPILE HEART ©IDEA FACTORY/COMPILE HEART</div>
            <div class="title">Programming</div>
            <div class="list">今天的风儿好喧嚣<br />Take it Easy!</div>
            <div class="title">Localization</div>
            <div class="list">
                Shiro<br />R3M11X（ΦωΦ）<br />afs<br />星空月之夜<br />JaviHunt<br />小莫<br />Raul<br />MrPortal
            </div>
            <div class="title">Special Thanks</div>
            <div class="list">Eisa</div>
        </div>
    </div>
</template>

<script lang="ts">
import InfoSVG from '@/assets/img/info.svg';
import Slider from '@/module/config/reusable/Slider.vue';
import ToggleSwitch from '@/module/config/reusable/ToggleSwitch.vue';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
    components: { ToggleSwitch, Slider },
})
export default class EffectsSettings extends Vue {
    static readonly ICON = InfoSVG;
    static readonly TITLE = 'about';

    title = process.env.NAME;
    ver = process.env.VERSION;
}
</script>

<style scoped lang="stylus">
.about
    display flex
    height 100%
    padding-top 36px
    flex-flow column
    text-align center
    font-family Palatino, Palatino Linotype, Palatino LT STD, Book Antiqua, Georgia, SimSun, serif

.headline
    color var(--accentColor)
    font-size 48px

.subtitle
    margin 16px 0 8px 0
    color #777

.desc
    margin-top 16px

.badge
    position relative
    margin 0 4px
    padding 0 4px
    background #666
    color #FFF
    font-size 14px

    &[data-title]:after
        content attr(data-title)
        position absolute
        display block
        top 0
        left 0
        width max-content
        padding 0 4px
        opacity 0
        background #666
        transition opacity .15s ease-out

    &:hover:after
        opacity 1

.credit
    flex-grow 1
    margin-top 16px
    padding 16px
    background #0002

    .header
        margin-bottom 16px
        font-size 24px

    .title
        margin-bottom 8px
        font-weight bold

    .list
        margin-bottom 24px
        line-height 1.8
</style>
