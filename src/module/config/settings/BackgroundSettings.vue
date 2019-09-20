<template>
    <div class="page">
        <FileInput @change="imageInputChange" />

        <TransitionGroup name="list" tag="div" class="bg-list">
            <div
                v-for="(image, i) in images"
                :key="image.name"
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
                <CheckSVG class="check" />

                <div
                    v-if="deleting === i && deletingProgress > 0"
                    class="delete-cover"
                    :style="{ transform: `translateY(${(1 - deletingProgress) * 100}%)` }"
                ></div>
                <CloseSVG
                    v-if="selected !== i"
                    class="delete"
                    @click.stop=""
                    @mousedown.stop="deleteStart(i)"
                    @mouseup.stop="deleteCancel"
                    @mouseleave="deleteCancel"
                />
            </div>
        </TransitionGroup>
    </div>
</template>

<script lang="ts">
import CheckSVG from '@/assets/img/check.svg';
import CloseSVG from '@/assets/img/close.svg';
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
    components: { FileInput, Slider, CheckSVG, CloseSVG },
})
export default class BackgroundSettings extends Vue {
    static title = 'BACKGROUND';

    get configModule() {
        return (this.$parent as SettingsPanel).configModule();
    }

    imageDir = BackgroundModule.IMAGE_PATH;

    images: ImageEntity[] = [];

    selected = -1;

    deleting = -1; // the index of image that will be deleted after progress goes to 1
    deletingTime = 500; // time required to press and hold the button to delete
    deletingProgress = 0; // 0 ~ 1
    deletingRafID = -1; // ID returned by requestAnimationFrame()

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

        // reset the input, otherwise its "change" event will never be triggered when user selects same file again
        (e.target as HTMLInputElement).value = '';
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

    deleteStart(index: number) {
        this.deleting = index;

        // ensure there is no active animation
        if (this.deletingRafID === -1) {
            this.deletingProgress = 0;

            const startTime = performance.now();

            // make deleting animation
            const tick = (now: DOMHighResTimeStamp) => {
                this.deletingProgress = (now - startTime) / this.deletingTime;

                if (this.deletingProgress > 1) {
                    this.deletingRafID = -1;
                    this.delete();
                } else {
                    this.deletingRafID = requestAnimationFrame(tick);
                }
            };

            tick(startTime);
        }
    }

    deleteCancel() {
        this.deletingProgress = 0;
        this.deleting = -1;

        if (this.deletingRafID != -1) cancelAnimationFrame(this.deletingRafID);
        this.deletingRafID = -1;
    }

    delete() {
        if (this.images[this.deleting]) {
            this.configModule.app.emit('bgDelete', this.images[this.deleting].name);
            this.images.splice(this.deleting, 1);
        }

        // this method can also be used to clean up
        this.deleteCancel();
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

        .delete
            opacity 1

.bg-item-img
    position absolute
    display block
    top 0
    left 0
    width 100%
    height 100%
    background #AAA
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

.delete-cover
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    background #C0392BAA

.delete
    position absolute
    display block
    top 0
    right 0
    width 24px
    height 24px
    background #0000
    opacity 0
    transition opacity .15s ease-out, background-color .15s ease-out

    &:hover
        background #E74C3C

.card
    overflow hidden
    border-radius 4px
    box-shadow 0 3px 1px -2px #0003, 0 2px 2px 0px #0002, 0 1px 5px 0px #0002

/* animation */
.bg-item
    display block
    transition all .2s

.list-enter, .list-leave-to
    opacity 0

.list-leave-active
    position absolute
</style>
