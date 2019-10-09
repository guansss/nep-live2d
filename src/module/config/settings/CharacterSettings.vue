<template>
    <div class="model">
        <div class="list">
            <div class="actions">
                <div :class="['action general', { selected: !selectedModel }]" @click="selectModel(null)">
                    <TuneSVG class="icon" />
                </div>
                <FileInput class="action" accept=".json" v-model="modelFile" />
            </div>

            <div
                v-for="(model, i) in models"
                :key="i"
                :class="['item', { selected: selectedModel === model }]"
                @click="selectModel(model)"
            >
                <img v-if="model.preview" :src="model.preview" class="preview" />
                <div v-else class="preview-alt">{{ model.name }}</div>
            </div>
        </div>

        <div v-if="!selectedModel">
            <ToggleSwitch key="dont reuse!" v-model="draggable">Draggable</ToggleSwitch>
        </div>
        <div v-else>
            <details class="details">
                <summary>Details</summary>
                <div>{{ details }}</div>
            </details>

            <div v-if="selectedModel.error" class="error">{{ selectedModel.error }}</div>
            <div v-else-if="selectedModel.loading">
                Loading...<br /><br />If loading never finishes, you can check the logs for details.
            </div>

            <template v-else>
                <ToggleSwitch v-model="selectedModel.config.enabled" @change="enableChanged">Enabled</ToggleSwitch>
                <Slider v-model="selectedModel.config.scale" overlay :min="0.01" :max="1.5" @change="saveModels">Scale
                </Slider>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import FaceSVG from '@/assets/img/face-woman.svg';
import TuneSVG from '@/assets/img/tune.svg';
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

    get loading() {
        return (this.config ? this.config.enabled : true) && !this.loaded && !this.error;
    }

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
    components: { TuneSVG, ToggleSwitch, FileInput, Slider },
})
export default class CharacterSettings extends Vue {
    static readonly ICON = FaceSVG;
    static readonly TITLE = 'CHARACTER';

    @Prop() readonly configModule!: ConfigModule;

    models: ModelEntity[] = [];

    modelFile: File | null = null;

    selectedModel: ModelEntity | null = null;

    draggable = this.configModule.getConfig('model.draggable', false);

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

    @Watch('draggable')
    draggableChanged(value: boolean) {
        this.configModule.app.emit('config', 'model.draggable', value, true);
    }

    @Watch('models')
    modelsChanged(models: ModelEntity[]) {
        if (models.length === 0) this.selectModel(null);
    }

    created() {
        this.configModule.app
            .on('configReady', (config: Config) => {
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
                this.saveModels();
            }
        });
    }

    modelLoaded(live2dModel: Live2DModel) {
        let model = this.models.find(model => (model.config && model.config.uid) === live2dModel.uid);

        if (!model) {
            model = new ModelEntity(live2dModel.modelSettings.path);
            model.attach(live2dModel);

            this.models.push(model);
            this.saveModels();
        } else {
            model.attach(live2dModel);
        }
    }

    selectModel(model: ModelEntity | null) {
        this.selectedModel = model;
    }

    enableChanged(value: boolean) {
        if (!value) {
            this.selectedModel!.loaded = false;
        }
        this.saveModels();
    }

    saveModels() {
        this.configModule.app.emit(
            'config',
            'model.models',
            this.models.map(model => model.config).filter(config => !!config),
        );
    }
}
</script>

<style scoped lang="stylus">
@require '../reusable/vars'

$itemSize = 144px

$selectableCard
    @extend $card
    background #EEE
    cursor pointer
    transition background-color .15s ease-out, box-shadow .15s ease-out

    &:hover
        background-color #FFF

    &.selected
        @extend $selectableCard:hover
        border-color var(--accentColor) !important
        cursor default

.actions
    display flex
    margin 8px 0 0 8px
    width $itemSize
    height $itemSize
    flex-flow column

.action
    @extend $selectableCard
    flex 1 0 0
    padding 8px

    &.general
        margin-bottom 8px
        border 2px solid transparent

    .icon
        width 100%
        height 100%

.list
    display flex
    padding 8px 16px 16px 8px
    flex-flow row wrap
    background #0002

.item
    @extend $selectableCard
    margin 8px 0 0 8px
    width $itemSize
    height $itemSize
    border 2px solid transparent

    .preview
    .preview-alt
        width 100%
        height 100%

    .preview-alt
        display flex
        align-items center

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
