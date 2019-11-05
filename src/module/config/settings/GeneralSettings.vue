<template>
    <div>
        <div class="section" :data-title="$t('theme')">
            <div class="themes">
                <div
                    v-for="(theme, i) in themes"
                    :key="i"
                    :class="['theme button', { selected: i === themeSelected }]"
                    @click="themeSelected = i"
                >
                    {{ $t(theme.name) }}
                </div>
            </div>
            <ToggleSwitch v-model="themeAuto">{{ $t('seasonal_theming') }}</ToggleSwitch>
        </div>
        <div class="section" :data-title="$t('misc')">
            <Slider progress v-model="volume">{{ $t('volume') }}</Slider>
            <Select v-model="locale" :options="localeOptions">{{ $t('language') }}</Select>
        </div>
    </div>
</template>

<script lang="ts">
import ShapeSVG from '@/assets/img/shape.svg';
import { LOCALE, THEMES } from '@/defaults';
import ConfigModule from '@/module/config/ConfigModule';
import Select, { Option } from '@/module/config/reusable/Select.vue';
import Slider from '@/module/config/reusable/Slider.vue';
import ToggleSwitch from '@/module/config/reusable/ToggleSwitch.vue';
import { Theme } from '@/module/theme/ThemeModule';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    components: { Select, ToggleSwitch, Slider },
})
export default class GeneralSettings extends Vue {
    static readonly ICON = ShapeSVG;
    static readonly TITLE = 'general';

    @Prop() readonly configModule!: ConfigModule;

    themes: Theme[] = THEMES;
    themeSelected = this.configModule.getConfig('theme.selected', -1);
    themeAuto = this.configModule.getConfig('theme.auto', true);

    volume = this.configModule.getConfig('volume', 0);

    locale = this.configModule.getConfig('locale', LOCALE);
    localeOptions!: Option[]; // non-reactive

    @Watch('themeSelected')
    themeChanged(value: number) {
        this.themeAuto = false;
        this.configModule.setConfig('theme.selected', value);
    }

    @Watch('themeAuto')
    themeAutoChanged(value: boolean) {
        this.configModule.setConfig('theme.auto', value);
    }

    @Watch('volume')
    volumeChanged(value: number) {
        this.configModule.setConfig('volume', value);
    }

    @Watch('locale')
    localeChanged(locale: string) {
        this.configModule.setConfig('locale', locale);
    }

    created() {
        const locales = (process.env.I18N as any) as Record<string, { language_name: string }>;

        this.localeOptions = Object.entries(locales).map(([locale, language]) => ({
            text: `${language.language_name} (${locale})`,
            value: locale,
        }));
    }
}
</script>

<style scoped lang="stylus">
.themes
    display flex
    padding 6px 16px 0

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
