<template>
    <div class="page">
        <FileInput @change="imageInputChange" />

        <div v-for="(image, i) in images" :key="i" class="bg-list" @click="selectImage(image)">
            <img
                v-if="image.valid"
                class="bg-item-img"
                :title="image.name"
                :src="imageDir + '/' + image.name"
                @load="imageLoaded(image)"
                @error="imageError(image)"
            />
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

    private created() {
        this.images = (this.configModule.getConfig('bg.images', []) as BackgroundImage[]).map(({ name }) => ({
            name,
            valid: true,
            saved: true,
        }));
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
        }
    }

    imageError(image: ImageEntity) {
        image.valid = false;
    }

    selectImage(image: ImageEntity) {
        this.configModule.app.emit('bgSelect', image.name);
    }
}
</script>

<style scoped lang="stylus">
.bg-list
    position relative
    cursor pointer

.bg-item-img
    display block
    width 200px
</style>
