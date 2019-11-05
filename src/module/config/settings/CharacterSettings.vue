<template>
    <div class="model">
        <div class="list">
            <div class="actions">
                <div :class="['action general', { selected: selectedIndex === -1 }]" @click="selectedIndex = -1">
                    <TuneSVG class="icon" />
                </div>
                <FileInput class="action" accept=".json" v-model="modelFile" />
            </div>

            <div
                v-for="(model, i) in models"
                :key="model.config.id"
                :class="['item', { selected: selectedIndex === i }]"
                @click="selectedIndex = i"
            >
                <img v-if="model.config && model.config.preview" :src="model.config.preview" class="preview" />
                <div v-else class="preview-alt">{{ model.name }}</div>

                <div
                    v-if="deletingIndex === i && deletingProgress > 0"
                    class="delete-cover"
                    :style="{ transform: `translateY(${(1 - deletingProgress) * 100}%)` }"
                ></div>
                <CloseSVG
                    v-if="!(model.config && model.config.internal)"
                    class="delete"
                    @click.stop=""
                    @mousedown.stop="deleteStart(i)"
                    @mouseup.stop="deleteCancel"
                    @mouseleave="deleteCancel"
                />
            </div>
        </div>

        <div v-if="!selectedModel">
            <ToggleSwitch key="s1" v-model="draggable">{{ $t('dragging') }}</ToggleSwitch>
            <ToggleSwitch key="s2" v-model="focusOnPress">{{ $t('focus_on_press') }}</ToggleSwitch>
            <Slider v-if="!focusOnPress" overlay :min="0" :max="focusTimeoutMax" v-model="focusTimeout"
            >{{ $t('focus_timeout') }}
            </Slider>
            <ToggleSwitch key="s3" v-model="bottomSubtitle">{{ $t('bottom_subtitle') }}</ToggleSwitch>
        </div>
        <div v-else>
            <details class="details button" :open="detailsExpanded" @click.prevent="detailsExpanded = !detailsExpanded">
                <summary>{{ $t('details') }}</summary>
                <template v-if="detailsExpanded">
                    <div>File: {{ selectedModel.path }}</div>
                    <div>Name: {{ selectedModel.name }}</div>
                    <div>Size: {{ selectedModel.width }} x {{ selectedModel.height }}</div>
                </template>
            </details>

            <div v-if="selectedModel.error" class="error">{{ selectedModel.error }}</div>
            <div v-else-if="selectedModel.loading">{{ $t('details') }}</div>

            <template v-else>
                <ToggleSwitch :value="selectedModel.config.enabled" @change="enableChanged">{{
                    $t('enabled')
                }}</ToggleSwitch>
                <Slider :value="selectedModel.config.scale" overlay :min="0.01" :max="scaleMax" @change="scaleChanged"
                >{{ $t('scale') }}
                </Slider>

                <div v-if="selectedModel.subtitleLanguages" class="sub-language">
                    <div class="label">{{ $t('language') }}</div>
                    <div class="button" @click.stop="showLanguages = true">{{ selectedLanguage }}</div>

                    <transition name="fade">
                        <div v-if="showLanguages" class="overlay" @click.stop="showLanguages = false">
                            <ul class="languages">
                                <li
                                    v-for="language in selectedModel.subtitleLanguages"
                                    :key="language.locale"
                                    :class="[
                                        'language',
                                        { selected: language.locale.includes(selectedModel.config.locale) },
                                    ]"
                                    @click="localeChanged(language.locale)"
                                >
                                    <div class="title">
                                        {{ language.name }}
                                        <span v-if="language.locale.includes(fallbackLocale)">{{ $t('Default') }}</span>
                                    </div>
                                    <div v-if="language.authors" class="authors">
                                        <span v-for="author in language.authors" :key="author">{{ author }}</span>
                                    </div>
                                    <div v-if="language.description">{{ language.description }}</div>
                                </li>
                            </ul>
                        </div>
                    </transition>
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import CloseSVG from '@/assets/img/close.svg';
import TShirtSVG from '@/assets/img/tshirt.svg';
import TuneSVG from '@/assets/img/tune.svg';
import Live2DModel from '@/core/live2d/Live2DModel';
import { clamp } from '@/core/utils/math';
import { FOCUS_TIMEOUT_MAX, LIVE2D_SCALE_MAX, LOCALE } from '@/defaults';
import ConfigModule from '@/module/config/ConfigModule';
import FileInput from '@/module/config/reusable/FileInput.vue';
import Slider from '@/module/config/reusable/Slider.vue';
import ToggleSwitch from '@/module/config/reusable/ToggleSwitch.vue';
import Live2DMotionModule from '@/module/live2d-motion/Live2DMotionModule';
import {
    FALLBACK_LOCALE as SUBTITLE_FALLBACK_LOCALE,
    Language,
    SubtitleJSON,
} from '@/module/live2d-motion/SubtitleManager';
import Live2DModule from '@/module/live2d/Live2DModule';
import Live2DSprite from '@/module/live2d/Live2DSprite';
import { makeModelPath, ModelConfig, toActualValues, toStorageValues } from '@/module/live2d/ModelConfig';
import { basename } from 'path';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

class ModelEntity {
    config = {} as ModelConfig;

    name: string;
    path: string;

    width = 0;
    height = 0;

    loaded = false;
    error?: string;

    subtitleLanguages?: (Pick<Language, 'locale' | 'name' | 'description'> & { authors?: string[] })[];

    get loading() {
        // missing config means the model is newly added and thus supposed to be enabled
        const enabled = this.config ? this.config.enabled : true;
        return enabled && !this.loaded && !this.error;
    }

    constructor(config: ModelConfig) {
        this.name = basename(config.path)
            .replace('.model.json', '')
            .replace('.json', '');
        this.path = config.path;

        this.updateConfig(config);
    }

    updateConfig(config: ModelConfig) {
        Object.assign(this.config, toActualValues(config));
    }

    attach(live2dModel: Live2DModel) {
        this.loaded = true;
        this.name = live2dModel.name;
        this.width = live2dModel.width;
        this.height = live2dModel.height;
    }
}

@Component({
    components: { CloseSVG, TuneSVG, ToggleSwitch, FileInput, Slider },
})
export default class CharacterSettings extends Vue {
    static readonly ICON = TShirtSVG;
    static readonly TITLE = 'character';

    @Prop() readonly configModule!: ConfigModule;

    models: ModelEntity[] = [];

    modelFile: File | null = null;

    selectedIndex = -1;

    deletingIndex = -1; // the index of model that will be deleted when progress goes to 1
    deletingHoldTime = 800; // time required to press and hold the delete button
    deletingProgress = 0; // 0 ~ 1
    deletingRafID = -1;

    detailsExpanded = false;

    draggable = this.configModule.getConfig('live2d.draggable', false);
    focusOnPress = this.configModule.getConfig('live2d.fPress', false);
    focusTimeout = this.configModule.getConfig('live2d.fTime', 0) / 1000;
    bottomSubtitle = this.configModule.getConfig('sub.bottom', false);

    scaleMax = LIVE2D_SCALE_MAX;
    focusTimeoutMax = FOCUS_TIMEOUT_MAX / 1000;

    defaultLocale = this.configModule.getConfig('locale', LOCALE);
    fallbackLocale!: string; // non-reactive
    showLanguages = false;

    get selectedModel() {
        return this.models[this.selectedIndex];
    }

    get selectedLanguage() {
        const model = this.selectedModel;
        const defaultLocale = this.defaultLocale;

        if (!model) return '';

        const locale = model.config.locale || defaultLocale;
        const language =
            model.subtitleLanguages!.find(language => language.locale.includes(locale)) ||
            model.subtitleLanguages!.find(language => language.locale.includes(this.fallbackLocale));
        return language ? language.name : '';
    }

    @Watch('modelFile')
    modelFileChanged(value: File | null) {
        if (value) {
            const path = makeModelPath(value.name);

            if (!this.models.find(model => model.path === path)) {
                this.addModel(path);
            }
        }
    }

    @Watch('draggable')
    draggableChanged(value: boolean) {
        this.configModule.app.emit('config', 'live2d.draggable', value, true);
    }

    @Watch('focusOnPress')
    focusOnPressChanged(value: boolean) {
        this.configModule.app.emit('config', 'live2d.fPress', value);
    }

    @Watch('focusTimeout')
    focusTimeoutChanged(value: number) {
        this.configModule.app.emit('config', 'live2d.fTime', ~~(value * 1000));
    }

    @Watch('bottomSubtitle')
    bottomSubtitleChanged(value: boolean) {
        this.configModule.app.emit('config', 'sub.bottom', value, true);
    }

    created() {
        this.fallbackLocale = SUBTITLE_FALLBACK_LOCALE;

        this.configModule.app
            .on('live2dLoaded', this.modelLoaded, this)
            .on('live2dError', this.modelError, this)
            .on('live2dSubtitleLoaded', this.subtitleLoaded, this)
            .on('config:live2d.internalModels', this.updateModels, this)
            .on('config:live2d.models', this.updateModels, this)
            .on('config:locale', (locale: string) => (this.defaultLocale = locale));

        let subtitles: Live2DMotionModule['subtitleManager']['subtitles'] = {};

        // fetch existing subtitles
        const live2dMotionModule = this.configModule.app.modules['Live2DMotion'] as Live2DMotionModule;
        if (live2dMotionModule) subtitles = live2dMotionModule.subtitleManager.subtitles;

        // fetch existing models and match subtitles
        const live2dModule = this.configModule.app.modules['Live2D'] as Live2DModule;
        if (live2dModule) {
            live2dModule.player.sprites.forEach(sprite => {
                this.modelLoaded(sprite.id, sprite);

                const subtitle = subtitles[sprite.model.modelSettings.subtitle || ''];
                subtitle && this.subtitleLoaded(sprite.id, subtitle);
            });
        }
    }

    updateModels() {
        const internalConfigs = this.configModule.getConfig<ModelConfig[]>('live2d.internalModels', []);
        const savedConfigs = this.configModule.getConfig<ModelConfig[]>('live2d.models', []);

        const models: ModelEntity[] = [];

        internalConfigs.forEach(config => {
            let model = this.models.find(model => model.config.id === config.id);

            if (model) {
                model.updateConfig(config);
            } else {
                model = new ModelEntity(config);
            }
            models.push(model);
        });

        savedConfigs.forEach(config => {
            let model = this.models.find(model => model.config.id === config.id);

            if (model) {
                model.updateConfig(config);

                if (!models.includes(model)) models.push(model);
            } else {
                model = new ModelEntity(config);
                models.push(model);
            }
        });

        this.models = models;

        if (this.selectedIndex !== -1) {
            this.selectedIndex = models.length === 0 ? -1 : clamp(this.selectedIndex, 0, models.length - 1);
        }
    }

    addModel(path: string) {
        this.configModule.app.emit('live2dAdd', path);
    }

    modelLoaded(id: number, sprite: Live2DSprite) {
        let model = this.models.find(model => model.config.id === id);
        model && model.attach(sprite.model);
    }

    modelError(id: number, error: Error | string) {
        let model = this.models.find(model => model.config.id === id);

        if (model) {
            model.error =
                error instanceof Error
                    ? error.message.includes('Failed to fetch')
                    ? 'Failed to load model file. Have you put files in "live2d" folder of this wallpaper?'
                    : error.toString()
                    : error;
        }
    }

    subtitleLoaded(id: number, languages: SubtitleJSON) {
        let model = this.models.find(model => model.config.id === id);

        if (model) {
            model.subtitleLanguages = languages.map(({ locale, name, author, description }) => ({
                locale,
                name,
                authors: author ? author.split('\n') : undefined,
                description,
            }));
        }
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
            this.configModule.app.emit('live2dRemove', model.config.id);
        }

        // this method can also be used to clean up
        this.deleteCancel();
    }

    enableChanged(value: boolean) {
        if (!value) {
            // reset loaded state
            this.selectedModel.loaded = false;
        }
        this.configModule.app.emit('live2dConfig', this.selectedModel.config.id, { enabled: value });
    }

    scaleChanged(value: number) {
        this.configModule.app.emit('live2dConfig', this.selectedModel.config.id, toStorageValues({ scale: value }));
    }

    localeChanged(value: string) {
        this.configModule.app.emit('live2dConfig', this.selectedModel.config.id, toStorageValues({ locale: value }));
    }
}
</script>

<style scoped lang="stylus">
@require '../reusable/vars'

$itemSize = 144px

$selectableCard
    @extend $card
    @extend $card-hover
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
    justify-content center
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
    display inline-block
    margin 8px 16px
    padding 8px
    font .8em / 1.2em Consolas, monospace
    white-space pre-wrap

    &[open]
        display block

        >>> summary
            margin-bottom 4px

    >>> summary
        outline none

.sub-language
    display flex
    padding 8px 16px
    align-items center

    .button
        margin-bottom 0
        padding 8px
        line-height 1.3

        &:after
            content '...'
            margin-left 8px
            padding-left 8px
            font-weight bold
            border-left 1px solid #888

.overlay
    position fixed
    z-index 1000
    top 0
    right 0
    bottom 0
    left 0
    display flex
    justify-content center
    align-items center
    background #0002

.languages
    @extend $card
    width 400px
    background #FAFAFA

.language
    padding 8px 0
    color #999
    font-size 14px
    border-right 8px solid transparent
    border-bottom 1px solid #EEE
    border-left 8px solid transparent
    transition background-color .15s ease-out

    &.selected
        background #EEE

    &:hover
        background #E6E6E6

    .title
        margin-bottom 4px
        color #333
        font-weight bold

        span
            margin-left 4px
            vertical-align middle
            padding 2px
            background #999
            color #FFF
            font-size 12px
            font-weight normal

    .authors
        margin-bottom 4
        font-size 12px
        font-style italic

        span:not(:first-child)
            margin-left 8px
            padding-left 4px
            border-left 1px solid #CCC

// animation

.fade-enter-active, .fade-leave-active
    transition opacity .15s ease-out

.fade-enter, .fade-leave-to
    opacity 0
</style>
