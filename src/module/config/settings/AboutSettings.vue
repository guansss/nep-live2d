<template>
    <div class="about">
        <div class="headline" @click="++counter > 2 ? ($event.target.dataset.alt = 'Weeb Live2D') : 0">{{ title }}</div>
        <div class="subtitle">{{ $t('subtitle') }}</div>
        <div>
            <span class="badge">v{{ ver }}</span>
            <span class="badge">{{ time }}</span>
            <span class="badge" data-title="/guansss/nep-live2d">Now on GitHub</span>
        </div>

        <div class="desc">{{ $t('desc') }}</div>

        <div v-if="$t('changelog_important')" class="changelog">
            <div class="title important">{{ $t('important_changes') }}</div>
            <div class="content">{{$t('changelog_important')}}</div>
        </div>

        <div class="changelog">
            <div class="title">{{ $t('changelog') }}</div>
            <div v-for="log in $t('changelog_logs')" :key="log">· {{ log }}</div>
        </div>

        <div class="credit">
            <div class="header">Credits</div>
            <div class="title">Live2D Models</div>
            <div class="list">MAINICHI COMPILE HEART ©IDEA FACTORY/COMPILE HEART</div>
            <div class="title">Programming</div>
            <div class="list">今天的风儿好喧嚣<br />Take it Easy!</div>
            <div class="title">Localization</div>
            <div class="list">
                Shiro<br />R3M11X（ΦωΦ）<br />afs<br />星空月之夜<br />
                JaviHunt<br />小莫<br />Raul<br />MrPortal<br />Lord Lionnel
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
    time = new Date(process.env.BUILT_TIME!).toLocaleDateString();

    counter = 0; // :P
}
</script>

<style scoped lang="stylus">
.about
    display flex
    height 100%
    padding-top 36px
    flex-flow column
    text-align center
    font-family Palatino, Palatino Linotype, Palatino LT STD, Book Antiqua, Georgia, Microsoft YaHei UI, serif

.headline
    position relative
    color var(--accentColor)
    font-size 48px

    &[data-alt]
        align-self center
        color transparent
        transition color 1s linear

        &:after
            content attr(data-alt)
            position absolute
            right 0
            color var(--accentColor)
            transition color 1s linear

    &:after
        content ''
        color transparent

.subtitle
    margin 16px 0 8px 0
    color #777

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

.desc
    margin 24px 8px

.changelog
    margin-top 24px
    width 100%
    padding 8px 24px
    background #0001
    text-align left

    .title
        margin-bottom 4px
        font-weight bold

        &.important
            font-size 120%
            color var(--accentColor)

    .content
        white-space pre-wrap

.credit
    flex-grow 1
    margin-top 24px
    padding 16px
    background #0002
    color #333

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
