<template>
    <div>
        <div v-if="showImage" class="bg-list">
            <div
                v-for="image in images"
                :key="image"
                :class="['bg-item', { selected: image === selected }]"
                @click="selectImage(image)"
            >
                <img class="bg-item-img" :title="image" :src="image" />
                <CheckSVG class="check" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import CheckSVG from '@/assets/img/check.svg';
import ImageSVG from '@/assets/img/image.svg';
import { inWallpaperEngine } from '@/core/utils/misc';
import { BACKGROUNDS } from '@/defaults';
import ConfigModule from '@/module/config/ConfigModule';
import FileInput from '@/module/config/reusable/FileInput.vue';
import Scrollable from '@/module/config/reusable/Scrollable.vue';
import Slider from '@/module/config/reusable/Slider.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
    components: { Scrollable, FileInput, Slider, CheckSVG },
})
export default class BackgroundSettings extends Vue {
    static readonly ICON = ImageSVG;
    static readonly TITLE = 'background';

    @Prop() readonly configModule!: ConfigModule;

    images: string[] = BACKGROUNDS.slice();

    selected = '';

    showImage = false;

    private created() {
        this.configModule.app
            .on('config:bg.img', (image: string) => (this.selected = image))
            .on('weFilesUpdate:bgDirectory', this.imageChange, this)
            .on('weFilesRemove:bgDirectory', this.imageChange, this);

        if (!inWallpaperEngine) {
            // get some random images!
            this.images = [
                ...BACKGROUNDS,
                'https://w.wallhaven.cc/full/r2/wallhaven-r2qqlj.jpg',
                'https://w.wallhaven.cc/full/kw/wallhaven-kw1ky1.jpg',
                'https://w.wallhaven.cc/full/vm/wallhaven-vmx153.jpg',
                'https://w.wallhaven.cc/full/48/wallhaven-482r8j.jpg',
                'https://w.wallhaven.cc/full/qd/wallhaven-qddrv7.jpg',
                'https://w.wallhaven.cc/full/d5/wallhaven-d5x9rm.jpg',
                'https://w.wallhaven.cc/full/k9/wallhaven-k993g7.jpg',
            ];
        }
    }

    imageChange(files: string[], allFiles: string[]) {
        this.images = [...BACKGROUNDS, ...allFiles];
    }

    selectImage(image: string) {
        this.configModule.setConfig('bg.img', image);

        this.selected = image;
    }

    beforeClose() {
        // transforming images is a heavy job and will cause stuttering animation, especially when images here are
        //  super high resolution background images, so we should hide them before transformation
        this.showImage = false;
    }

    afterOpen() {
        this.showImage = true;
    }
}
</script>

<style scoped lang="stylus">
@require '../reusable/vars'

.input
    margin 16px 16px 0

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
            transform scale(1.1)

.bg-item-img
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
