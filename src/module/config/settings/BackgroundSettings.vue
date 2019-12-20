<template>
    <div class="bg">
        <div class="options section">
            <Select
                :value="fillType"
                :options="[{ text: $t('cover'), value: 'cover' }, { text: $t('fill'), value: 'fill' }]"
                @change="setFillType"
            >{{ $t('fill_type') }}</Select
            >
            <Slider v-if="videoSelected" :value="volume" @change="setVolume">{{ $t('volume') }}</Slider>
        </div>

        <div class="tabs button-group">
            <div v-for="(icon, i) in tabs" :key="i" :class="['button', { active: i === tab }]" @click="tab = i">
                <component :is="icon" class="svg" />
            </div>
        </div>

        <template v-if="contentVisible">
            <template v-if="tab < 2">
                <i18n v-if="tab === 1 && !imgDir" class="info" tag="div" path="no_bg_dir">
                    <b>{{ $t('ui_img_dir') }}</b>
                </i18n>
                <div v-else class="info">{{ tab === 1 ? imgDir : $t('built_in') }}&nbsp;</div>
                <div class="bg-list">
                    <div
                        v-for="img in displayImages"
                        :key="img"
                        :class="['bg-item', { selected: img === selected }]"
                        @click="select(img)"
                    >
                        <img class="bg-item-img" :title="img" :src="img" />
                        <CheckSVG class="check" />
                    </div>
                </div>
            </template>

            <template v-else>
                <i18n v-if="!vidDir" class="info" path="no_bg_dir">
                    <b>{{ $t('ui_vid_dir') }}</b>
                </i18n>
                <div v-else class="info">{{ vidDir }}&nbsp;</div>
                <div class="bg-list">
                    <div
                        v-for="vid in videos"
                        :key="vid"
                        :class="['bg-item', { selected: vid === selected }]"
                        @click="select(vid)"
                    >
                        <video class="bg-item-vid" :title="vid" :src="vid" preload="metadata"></video>
                        <CheckSVG class="check" />
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>

<script lang="ts">
import CheckSVG from '@/assets/img/check.svg';
import ImageListSVG from '@/assets/img/image-multiple.svg';
import ImageSVG from '@/assets/img/image.svg';
import StarSVG from '@/assets/img/star.svg';
import VideoListSVG from '@/assets/img/video-multiple.svg';
import { inWallpaperEngine } from '@/core/utils/misc';
import { BACKGROUNDS } from '@/defaults';
import { isVideo } from '@/module/background/BackgroundModule';
import ConfigModule from '@/module/config/ConfigModule';
import Scrollable from '@/module/config/reusable/Scrollable.vue';
import Select from '@/module/config/reusable/Select.vue';
import Slider from '@/module/config/reusable/Slider.vue';
import ToggleSwitch from '@/module/config/reusable/ToggleSwitch.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

const enum TAB {
    BUILT_IN,
    IMAGE,
    VIDEO,
}

@Component({
    components: { Select, ToggleSwitch, Scrollable, Slider, CheckSVG, StarSVG, ImageListSVG, VideoListSVG },
})
export default class BackgroundSettings extends Vue {
    static readonly ICON = ImageSVG;
    static readonly TITLE = 'background';

    @Prop() readonly configModule!: ConfigModule;

    // transforming images/videos is a heavy job and will cause stuttering animation, they should be hidden before transformation
    @Prop({ type: Boolean }) readonly contentVisible!: boolean;

    tabs = [StarSVG, ImageListSVG, VideoListSVG];
    tab = TAB.BUILT_IN;

    imgDir = '';
    vidDir = '';

    images: string[] = [];
    videos: string[] = [];

    get displayImages() {
        const images = this.images;
        return this.tab === TAB.IMAGE ? images : BACKGROUNDS;
    }

    selected = '';
    fillType = '';
    volume = 0;

    get videoSelected() {
        return isVideo(this.selected);
    }

    private created() {
        this.configModule.app
            .on('config:bg.src', this.srcChanged, this)
            .on('config:bg.fill', this.fillChanged, this)
            .on('config:bg.volume', this.volumeChanged, this)
            .on('we:imgDir', this.imgDirChanged, this)
            .on('we:vidDir', this.vidDirChanged, this)
            .on('weFilesUpdate:imgDir', this.imageUpdated, this)
            .on('weFilesRemove:imgDir', this.imageUpdated, this)
            .on('weFilesUpdate:vidDir', this.videoUpdated, this)
            .on('weFilesRemove:vidDir', this.videoUpdated, this);

        this.fillChanged(this.configModule.getConfig('bg.fill', undefined));
        this.volumeChanged(this.configModule.getConfig('bg.volume', undefined));
        this.srcChanged(this.configModule.getConfig('bg.src', ''));

        if (!inWallpaperEngine) {
            // get some random samples in browser!
            this.images = Array.from({ length: 10 }, (_, i) => 'https://loremflickr.com/1280/720/background?r=' + i);
            this.videos = [
                'https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                'https://www.sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4',
                'https://www.sample-videos.com/video123/mp4/360/big_buck_bunny_360p_1mb.mp4',
            ];
        }
    }

    setFillType(fillType: string) {
        this.configModule.setConfig('bg.fill', fillType === 'fill' ? true : undefined);
    }

    setVolume(volume: number) {
        this.configModule.setConfig('bg.volume', volume);
    }

    select(src: string) {
        this.configModule.setConfig('bg.src', src);
    }

    imgDirChanged(imgDir: string) {
        this.imgDir = imgDir;
    }

    vidDirChanged(vidDir: string) {
        this.vidDir = vidDir;
    }

    fillChanged(fill?: boolean) {
        this.fillType = fill ? 'fill' : 'cover';
    }

    volumeChanged(volume?: number) {
        this.volume = volume || 0;
    }

    srcChanged(src: string) {
        this.selected = src;
        this.tab = this.selected.startsWith('img') ? TAB.BUILT_IN : isVideo(src) ? TAB.VIDEO : TAB.IMAGE;

        if (this.tab !== TAB.VIDEO) {
            // clear volume when background is set to image
            this.configModule.setConfig('bg.volume', undefined);
        }
    }

    imageUpdated(files: string[], allFiles: string[]) {
        this.images = allFiles.slice();
    }

    videoUpdated(files: string[], allFiles: string[]) {
        // TODO: remove ogg filter when the bug is fixed
        // see https://steamcommunity.com/app/431960/discussions/2/1644304412672544283/
        this.videos = allFiles.filter(file => !file.endsWith('ogg'));
    }

    beforeDestroy() {
        this.configModule.app
            .off('config:bg.src', this.srcChanged)
            .off('config:bg.fill', this.fillChanged)
            .off('config:bg.volume', this.volumeChanged)
            .off('weFilesUpdate:imgDir', this.imageUpdated)
            .off('weFilesRemove:imgDir', this.imageUpdated)
            .off('weFilesUpdate:vidDir', this.videoUpdated)
            .off('weFilesRemove:vidDir', this.videoUpdated);
    }
}
</script>

<style scoped lang="stylus">
@require '../reusable/vars'

.options
    padding-top 8px

.tabs
    margin-top 8px
    padding 6px 16px 0
    justify-content center

.info
    margin 8px 16px 0 16px
    padding 4px
    background #0002
    color #666
    font 14px Consolas, monospace
    word-break break-all
    box-shadow inset 0 0 3px #0001

.bg-list
    display grid
    padding 16px
    width 100%
    height 100%
    grid-template-columns repeat(3, 1fr)
    grid-gap 8px

.bg-item
    @extend $card
    @extend $card-hover
    position relative
    cursor pointer

    &.selected
        .check
            opacity 1

    &:before
        content ''
        display block
        padding-bottom (9 / 16) * 100%

    &:hover
        .bg-item-img
        .bg-item-vid
            transform scale(1.1)

.bg-item-img
.bg-item-vid
    position absolute
    display block
    top 0
    left 0
    width 100%
    height 100%
    background #AAA
    object-fit cover
    will-change transform
    transition transform .15s ease-out

.check
    position absolute
    display block
    top 0
    left 0
    width 100%
    height 100%
    background #0004
    opacity 0
    object-fit cover
    transition opacity .2s
</style>
