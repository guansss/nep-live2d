<template>
    <div class="page">
        <FileInput @change="imageInputChange" />

        <div class="bg-list">
            <div
                v-for="(image, i) in images"
                :key="i"
                :class="['bg-item card', { selected: i === selected }]"
                @click="selectImage(image, i)"
            >
                <img
                    v-if="image.valid"
                    class="bg-item-img"
                    :title="image.name"
                    :src="imageDir + '/' + image.name"
                    @load="imageLoaded(image)"
                    @error="imageError(image)"
                />
                <svg class="check" viewBox="0 0 24 24">
                    <path fill="#FFF" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import BackgroundModule, { BackgroundImage } from '@/module/background';
import FileInput from '@/module/config/reusable/FileInput.vue';
import Slider from '@/module/config/reusable/Slider.vue';
import SettingsPanel from '@/module/config/SettingsPanel.js';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

interface ImageEntity {
    name: string;
    valid: boolean;
    saved: boolean;
}

@Component({
    components: { FileInput, Slider },
})
export default class BackgroundSettings extends Vue {
    static title = 'BACKGROUND';

    get configModule() {
        return (this.$parent as SettingsPanel).configModule();
    }

    imageDir = BackgroundModule.IMAGE_PATH;

    images: ImageEntity[] = [];

    selected = -1;

    private created() {
        this.images = (this.configModule.getConfig('bg.images', []) as BackgroundImage[]).map(({ name }) => ({
            name,
            valid: true,
            saved: true,
        }));

        this.selected = this.configModule.getConfig('bg.selected', this.selected);
    }

    imageInputChange(e: Event) {
        [...((e.target as HTMLInputElement).files || [])].forEach(file => {
            if (!this.images.find(image => image.name === file.name)) {
                this.images.push({
                    name: file.name,
                    valid: true,
                    saved: false,
                });
            }
        });
    }

    imageLoaded(image: ImageEntity) {
        if (!image.saved) {
            this.configModule.app.emit('bgSave', image.name);

            // let's assume that it's been saved...
            image.saved = true;
        }
    }

    imageError(image: ImageEntity) {
        image.valid = false;
    }

    selectImage(image: ImageEntity, index: number) {
        if (image.saved && image.valid) {
            this.configModule.app.emit('bgSelect', image.name);

            this.selected = index;
        }
    }
}
</script>

<style scoped lang="stylus">
.bg-list
    display grid
    padding 16px
    width 100%
    height 100%
    grid-template-columns repeat(3, 1fr)
    grid-gap 8px

.bg-item
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
    object-fit cover
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

.card
    overflow hidden
    border-radius 4px
    box-shadow 0 3px 1px -2px #0003, 0 2px 2px 0px #0002, 0 1px 5px 0px #0002
</style>
