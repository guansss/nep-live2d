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
            <ToggleSwitch v-model="themeAuto">Seasonal Theming</ToggleSwitch>
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
import ToggleSwitch from '@/module/config/reusable/ToggleSwitch.vue';
import { Theme } from '@/module/theme/ThemeModule';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    components: { ToggleSwitch, Slider },
})
export default class GeneralSettings extends Vue {
    static readonly ICON = ShapeSVG;
    static readonly TITLE = 'GENERAL';

    @Prop() readonly configModule!: ConfigModule;

    themes: Theme[] = THEMES;
    themeSelected = this.configModule.getConfig('theme.selected', -1);
    themeAuto = this.configModule.getConfig('theme.auto', true);

    volume = this.configModule.getConfig('volume', 0);

    @Watch('volume')
    volumeChanged(value: number) {
        this.configModule.setConfig('volume', value);
    }

    @Watch('themeSelected')
    themeChanged(value: number) {
        this.themeAuto = false;
        this.configModule.setConfig('theme.selected', value);
    }

    @Watch('themeAuto')
    themeAutoChanged(value: boolean) {
        this.configModule.setConfig('theme.auto', value);
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

    &:hover
        background #CCC

    &.selected
        background #555
        color white
</style>
