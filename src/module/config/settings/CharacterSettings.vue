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

                <div
                    v-if="deletingIndex === i && deletingProgress > 0"
                    class="delete-cover"
                    :style="{ transform: `translateY(${(1 - deletingProgress) * 100}%)` }"
                ></div>
                <CloseSVG
                    v-if="!(model.config && model.config.builtIn)"
                    class="delete"
                    @click.stop=""
                    @mousedown.stop="deleteStart(i)"
                    @mouseup.stop="deleteCancel"
                    @mouseleave="deleteCancel"
                />
            </div>
        </div>

        <div v-if="!selectedModel">
            <ToggleSwitch key="dont reuse me!" v-model="draggable">Draggable</ToggleSwitch>
        </div>
        <div v-else>
            <details class="details" :open="detailsExpanded" @click.prevent="detailsExpanded=!detailsExpanded">
                <summary>Details</summary>
                <template v-if="detailsExpanded">
                    <div>File: {{ selectedModel.path }}</div>
                    <div>Name: {{ selectedModel.name }}</div>
                    <div>Size: {{ selectedModel.width }} x {{ selectedModel.height }}</div>
                </template>
            </details>

            <div v-if="selectedModel.error" class="error">{{ selectedModel.error }}</div>
            <div v-else-if="selectedModel.loading">
                Loading...<br /><br />If loading never finishes, you can check the logs for details.
            </div>

            <template v-else>
                <ToggleSwitch v-model="selectedModel.config.enabled" @change="enableChanged">Enabled</ToggleSwitch>
                <Slider v-model="selectedModel.config.scale" overlay :min="0.01" :max="1.5" @change="scaleChanged"
                >Scale
                </Slider>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import CloseSVG from '@/assets/img/close.svg';
import FaceSVG from '@/assets/img/face-woman.svg';
import TuneSVG from '@/assets/img/tune.svg';
import Live2DModel from '@/core/live2d/Live2DModel';
import ConfigModule, { Config } from '@/module/config/ConfigModule';
import FileInput from '@/module/config/reusable/FileInput.vue';
import Slider from '@/module/config/reusable/Slider.vue';
import ToggleSwitch from '@/module/config/reusable/ToggleSwitch.vue';
import Live2DModule, {
    makeModelPath,
    ModelConfig,
    toRuntimeFormat,
    toStorageFormat,
} from '@/module/live2d/Live2DModule';
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

    config?: ModelConfig;

    get loading() {
        // missing config means the model is newly added and thus supposed to be enabled
        const enabled = this.config ? this.config.enabled : true;
        return enabled && !this.loaded && !this.error;
    }

    constructor(path: string, config?: ModelConfig) {
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
    }
}

const BASE_MODEL_CONFIG = {
    scale: 1,
};

@Component({
    components: { CloseSVG, TuneSVG, ToggleSwitch, FileInput, Slider },
})
export default class CharacterSettings extends Vue {
    static readonly ICON = FaceSVG;
    static readonly TITLE = 'CHARACTER';

    @Prop() readonly configModule!: ConfigModule;

    models: ModelEntity[] = [];

    modelFile: File | null = null;

    selectedModel: ModelEntity | null = null;

    deletingIndex = -1; // the index of model that will be deleted when progress goes to 1
    deletingHoldTime = 800; // time required to press and hold the delete button
    deletingProgress = 0; // 0 ~ 1
    deletingRafID = -1;

    detailsExpanded = false;

    draggable = this.configModule.getConfig('live2d.draggable', false);

    @Watch('modelFile')
    modelFileChanged(value: File | null) {
        const path = value && makeModelPath(value.name);

        if (path && !this.models.find(model => model.path === path)) {
            this.addModel(path);
        }
    }

    @Watch('draggable')
    draggableChanged(value: boolean) {
        this.configModule.app.emit('config', 'live2d.draggable', value, true);
    }

    @Watch('models')
    modelsChanged(models: ModelEntity[]) {
        if (models.length === 0) this.selectModel(null);
    }

    created() {
        this.configModule.app
            .on('configReady', (config: Config) => {
                const builtInModelConfigs = config.get('live2d.builtIns', []) as ModelConfig[];
                const modelConfigs = config.get('live2d.models', []) as ModelConfig[];

                this.models = modelConfigs.map(config => {
                    const builtInConfig = config.builtIn
                        ? builtInModelConfigs.find(builtInConfig => builtInConfig.path === config.path)
                        : undefined;

                    const mergedConfig = toRuntimeFormat(Object.assign({}, builtInConfig, config)) as ModelConfig;

                    return new ModelEntity(config.path, Object.assign({}, BASE_MODEL_CONFIG, mergedConfig));
                });
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

        this.configModule.app.emit(
            'live2dAdd',
            path,
            (err?: Error, live2dModel?: Live2DModel, config?: ModelConfig) => {
                if (err) {
                    model.error = err.message.includes('Failed to fetch')
                        ? 'Failed to load model file. Have you put files in "live2d" folder of this wallpaper?'
                        : err.toString();
                } else if (live2dModel) {
                    model.attach(live2dModel);
                    model.config = Object.assign({}, BASE_MODEL_CONFIG, toRuntimeFormat(config!) as ModelConfig);
                }
            },
        );
    }

    modelLoaded(live2dModel: Live2DModel) {
        let model = this.models.find(model => (model.config && model.config.uid) === live2dModel.uid);

        if (model) {
            model.attach(live2dModel);
        }
    }

    selectModel(model: ModelEntity | null) {
        this.selectedModel = model;
    }

    deleteStart(index: number) {
        this.deletingIndex = index;

        // ensure there is no active animation
        if (this.deletingRafID === -1) {
            this.deletingProgress = 0;

            const startTime = performance.now();

            // make deleting animation
            const tick = (now: DOMHighResTimeStamp) => {
                this.deletingProgress = (now - startTime) / this.deletingHoldTime;

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
        this.deletingIndex = -1;

        if (this.deletingRafID != -1) cancelAnimationFrame(this.deletingRafID);
        this.deletingRafID = -1;
    }

    delete() {
        const model = this.models[this.deletingIndex];

        if (model) {
            // TODO: cancel the task when model is loading?
            this.configModule.app.emit('live2dRemove', model.config && model.config.uid);
            this.models.splice(this.deletingIndex, 1);

            if (model === this.selectedModel) this.selectedModel = null;
        }

        // this method can also be used to clean up
        this.deleteCancel();
    }

    enableChanged(value: boolean) {
        if (!value) {
            this.selectedModel!.loaded = false;
        }
        this.configModule.app.emit('live2dConfig', this.selectedModel!.config!.uid, { enabled: value });
    }

    scaleChanged(value: number) {
        this.configModule.app.emit('live2dConfig', this.selectedModel!.config!.uid, toStorageFormat({ scale: value }));
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
    position relative
    margin 8px 0 0 8px
    width $itemSize
    height $itemSize
    border 2px solid transparent

    &:hover .delete
        opacity 1

.preview
.preview-alt
    width 100%
    height 100%

.preview-alt
    display flex
    align-items center
    padding: 8px;
    font-size: 120%;
    font-weight: bold;

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
    background #0002
    color #333
    opacity 0
    transition opacity .15s ease-out, background-color .15s ease-out, color .15s ease-out

    &:hover
        background #E74C3C
        color #FFF

        path
            fill currentColor

.details
    @extend $card
    display inline-block
    margin 8px 16px
    padding 8px
    background #666
    color #EEE
    font .8em / 1.2em Consolas, monospace
    white-space pre-wrap
    cursor pointer

    &[open]
        display block

        >>> summary
            margin-bottom 4px

    &:hover
        background #444

    >>> summary
        outline none
</style>
