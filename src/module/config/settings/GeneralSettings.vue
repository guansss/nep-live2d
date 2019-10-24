<template>
    <div>
        <div class="section" data-title="Theme">
            <div class="themes">
                <div
                    v-for="(theme, i) in themes"
                    :key="i"
                    :class="['theme button', { selected: i === themeSelected }]"
                    @click="themeSelected = i"
                >
                    {{ theme.name }}
                </div>
            </div>
        </div>
        <div class="section" data-title="Miscellaneous">
            <Slider progress v-model="volume">Volume</Slider>
        </div>
    </div>
</template>

<script lang="ts">
import ShapeSVG from '@/assets/img/shape.svg';
import { THEMES } from '@/defaults';
import ConfigModule from '@/module/config/ConfigModule';
import Slider from '@/module/config/reusable/Slider.vue';
import { Theme } from '@/module/theme/ThemeModule';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    components: { Slider },
})
export default class GeneralSettings extends Vue {
    static readonly ICON = ShapeSVG;
    static readonly TITLE = 'GENERAL';

    @Prop() readonly configModule!: ConfigModule;

    themes: Theme[] = THEMES;
    themeSelected = this.configModule.getConfig('theme.selected', -1);

    volume = this.configModule.getConfig('volume', 0);

    @Watch('volume')
    volumeChanged(value: number) {
        this.configModule.setConfig('volume', value);
    }

    @Watch('themeSelected')
    themeChanged(value: number) {
        this.configModule.setConfig('theme.selected', value);
    }
}
</script>

<style scoped lang="stylus">
.themes
    display flex
    padding 16px 16px 8px

.theme
    background #EEE
    color #333
    transition background-color .15s ease-out, color .15s, box-shadow .15s ease-out

    &.selected
        background #555
        color white
</style>
