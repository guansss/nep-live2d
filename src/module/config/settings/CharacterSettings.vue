<template>
    <div class="model">
        <div class="list">
            <div
                v-for="(model, i) in models"
                :key="i"
                :class="['item', { selected: selectedModel === model }]"
                @click="selectModel(model)"
            >
                <img v-if="model.preview" :src="model.preview" class="preview" />
                <div v-else class="preview-alt">{{ model.name }}</div>
            </div>
            <div class="item">
                <FileInput accept=".json" v-model="modelFile" />
            </div>
        </div>

        <div v-if="selectedModel" class="config">
            <details class="details">
                <summary>Details</summary>
                <div>{{ details }}</div>
            </details>

            <div v-if="selectedModel.error" class="error">{{ selectedModel.error }}</div>
            <div v-else-if="!selectedModel.loaded">
                Loading...<br /><br />If loading never finishes, you can check the logs for details.
            </div>

            <template v-else>
                <ToggleSwitch v-model="selectedModel.config.enabled" @change="enableChanged">Enabled</ToggleSwitch>
                <Slider v-model="selectedModel.config.scale" overlay :min="0.01" :max="1.5"
                    @change="scaleChanged">Scale
                </Slider>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import Live2DModel from '@/core/live2d/Live2DModel';
import ConfigModule, { Config } from '@/module/config/ConfigModule';
import FileInput from '@/module/config/reusable/FileInput.vue';
import Slider from '@/module/config/reusable/Slider.vue';
import ToggleSwitch from '@/module/config/reusable/ToggleSwitch.vue';
import Live2DModule, { SavedModel } from '@/module/live2d/Live2DModule';
import get from 'lodash/get';
import { basename } from 'path';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

class ModelEntity {
    name: string;
    path: string;
    preview?: string;
    width = 0;
    height = 0;

    loaded = false;
    error?: string;

    config?: SavedModel;

    constructor(path: string, config?: SavedModel) {
        this.name = basename(path);
        this.path = path;
        this.config = config;
    }

    attach(live2dModel: Live2DModel) {
        this.loaded = true;
        this.name = live2dModel.name;
        this.preview = live2dModel.modelSettings.preview;
        this.width = live2dModel.width;
        this.height = live2dModel.height;

        this.config = this.config || new SavedModel(live2dModel.uid, live2dModel.modelSettings.path);
    }
}

function makePath(fileName: string) {
    const separatorIndex = fileName.indexOf('.');
    const dir = fileName.slice(0, separatorIndex > 0 ? separatorIndex : undefined);
    return `live2d/${dir}/${fileName}`;
}

@Component({
    components: { ToggleSwitch, FileInput, Slider },
})
export default class CharacterSettings extends Vue {
    static title = 'CHARACTER';

    @Prop() readonly configModule!: ConfigModule;

    models: ModelEntity[] = [];

    modelFile: File | null = null;

    selectedModel: ModelEntity | null = null;

    get details() {
        return `File: ${this.selectedModel!.path}
Name: ${this.selectedModel!.name}
Size: ${this.selectedModel!.width} x ${this.selectedModel!.height}`;
    }

    @Watch('modelFile')
    modelFileChanged(value: File | null) {
        const path = value && makePath(value.name);

        if (path && !this.models.find(model => model.path === path)) {
            this.addModel(path);
        }
    }

    @Watch('models')
    modelsChanged(models: ModelEntity[]) {
        if (models.length === 0) this.selectModel(null);
        // select first model if it is the only one in list
        else if (models.length === 1 || !this.selectedModel) this.selectModel(this.models[0]);
    }

    created() {
        this.configModule.app
            .on('configInit', (config: Config) => {
                const savedModels = get(config, 'model.models', []) as SavedModel[];
                this.models = savedModels.map(saved => new ModelEntity(saved.path, saved));
            })
            .on('live2dLoaded', this.modelLoaded, this);

        // fetch existing models from Live2DModule
        const live2dModule = this.configModule.app.modules['Live2D'] as Live2DModule;
        if (live2dModule) {
            live2dModule.player.sprites.forEach(sprite => this.modelLoaded(sprite.model));
        }
    }

    addModel(path: string) {
        const model = new ModelEntity(path);
        this.models.push(model);

        this.configModule.app.emit('live2dAdd', path, (err?: Error, live2dModel?: Live2DModel) => {
            if (err) {
                model.error = err.message.includes('Failed to fetch')
                    ? 'Failed to load model file. Have you put files in "live2d" folder of this wallpaper?'
                    : err.toString();
            } else if (live2dModel) {
                model.attach(live2dModel);
                this.save();
            }
        });
    }

    modelLoaded(live2dModel: Live2DModel) {
        let model = this.models.find(model => (model.config && model.config.uid) === live2dModel.uid);

        if (!model) {
            model = new ModelEntity(live2dModel.modelSettings.path);
            model.attach(live2dModel);

            this.models.push(model);
            this.save();
        } else {
            model.attach(live2dModel);
        }
    }

    selectModel(model: ModelEntity | null) {
        this.selectedModel = model;
    }

    enableChanged() {
        this.save();
    }

    scaleChanged() {
        this.save();
    }

    save() {
        this.configModule.app.emit(
            'config',
            'model.models',
            this.models.map(model => model.config).filter(config => !!config),
        );
    }
}
</script>

<style scoped lang="stylus">
.list
    display flex
    padding 8px 16px 16px 8px
    flex-flow row wrap
    background #0002

.item
    position relative
    margin 8px 0 0 8px
    width 144px
    height 144px
    background #EEE
    cursor pointer
    border 2px solid transparent
    box-shadow 0 1px 1px #0001
    transition background-color .15s ease-out, box-shadow .15s ease-out

    .preview
    .preview-alt
    .file-input
        width 100%
        height 100%

    .preview-alt
        display flex
        align-items center

    &:hover
    &.selected
        background-color #FFF
        box-shadow 0 1px 6px #0005

    &.selected
        border-color var(--accentColor)
        cursor default

.details
    background #0001
    white-space pre-wrap
    font .8em / 1.2em Consolas, monospace

    >>> summary
        padding 8px 16px
        outline none
        cursor pointer
        transition background-color .15s ease-out

        &:hover
            background #0002

    >>> div
        padding 0 16px 16px 16px
</style>
