<template>
    <div>
        <div class="section" :data-title="$t('theme')">
            <div class="themes button-group">
                <div
                    v-for="(theme, i) in builtInThemes"
                    :key="i"
                    :class="['button', { active: theme === selectedTheme }]"
                    @click="selectTheme(i)"
                >
                    {{ $t(theme.name) }}
                </div>
                <LongClickAction
                    v-for="(theme, i) in customThemes"
                    :key="-i - 1"
                    :class="['button', { active: theme === selectedTheme }]"
                    :duration="1000"
                    @click.native="selectTheme(i, true)"
                    @long-click="deleteTheme(i)"
                >
                    {{ theme.name }}
                    <CloseSVG slot="control" class="delete svg" :style="{ opacity: themeEdit ? 1 : 0 }" />
                </LongClickAction>
                <br />
            </div>

            <div class="themes button-group">
                <div :class="['button', { active: themeEdit }]" @click="themeEdit = !themeEdit">
                    <SettingsSVG class="svg" />
                </div>
                <div class="button" @click="saveTheme(true)"><PlusSVG class="svg" /></div>
            </div>

            <ToggleSwitch config="theme.seasonal" v-model="seasonal">{{ $t('seasonal_theming') }}</ToggleSwitch>
        </div>
        <div class="misc section" :data-title="$t('misc')">
            <Slider progress config="volume" v-model="volume">{{ $t('volume') }}</Slider>
            <Slider int overlay :min="1" :max="maxFPSLimit" :step="1" config="fpsMax" v-model="maxFPS">
                {{ $t('max_fps') }}
            </Slider>
            <ToggleSwitch config="fps" v-model="showFPS">{{ $t('show_fps') }}</ToggleSwitch>
            <Select config="locale" v-model="locale" :options="localeOptions">{{ $t('_ui_language') }}</Select>
        </div>
    </div>
</template>

<script lang="ts">
import CloseSVG from '@/assets/img/close.svg';
import PlusSVG from '@/assets/img/plus.svg';
import SettingsSVG from '@/assets/img/settings.svg';
import ShapeSVG from '@/assets/img/shape.svg';
import { error } from '@/core/utils/log';
import { FPS_MAX, FPS_MAX_LIMIT, LOCALE, THEME_CUSTOM_OFFSET, THEMES } from '@/defaults';
import ConfigModule from '@/module/config/ConfigModule';
import LongClickAction from '@/module/config/reusable/LongClickAction.vue';
import Select from '@/module/config/reusable/Select.vue';
import Slider from '@/module/config/reusable/Slider.vue';
import ToggleSwitch from '@/module/config/reusable/ToggleSwitch.vue';
import { Theme } from '@/module/theme/ThemeModule';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

const TAG = 'GeneralSettings';

@Component({
    components: { LongClickAction, SettingsSVG, CloseSVG, PlusSVG, Select, ToggleSwitch, Slider },
})
export default class GeneralSettings extends Vue {
    static readonly ICON = ShapeSVG;
    static readonly TITLE = 'general';

    @Prop() readonly configModule!: ConfigModule;

    builtInThemes = THEMES;
    customThemes = this.configModule.getConfig<Theme[]>('theme.custom', []).slice();

    selectedThemeIndex = this.configModule.getConfig('theme.selected', -1);
    themeEdit = false;
    seasonal = true;

    volume = 0;

    showFPS = false;
    maxFPS = FPS_MAX;
    maxFPSLimit = FPS_MAX_LIMIT;

    locale = LOCALE;
    localeOptions = Object.entries((process.env.I18N as any) as Record<string, { language_name: string }>).map(
        ([locale, language]) => ({
            text: `${language.language_name} (${locale})`,
            value: locale,
        }),
    );

    get selectedTheme() {
        return this.selectedThemeIndex < THEME_CUSTOM_OFFSET
            ? this.builtInThemes[this.selectedThemeIndex]
            : this.customThemes[this.selectedThemeIndex - THEME_CUSTOM_OFFSET];
    }

    created() {
        this.configModule.app.on('config:*', this.configUpdate);
    }

    configUpdate(path: string, value: any) {
        if (path === 'theme.custom') {
            this.customThemes = value.slice();
        }
    }

    async selectTheme(index: number, custom = false) {
        if (this.themeEdit) return;

        if (await this.ensureThemeSaved()) {
            this.seasonal = false;

            this.selectedThemeIndex = custom ? index + THEME_CUSTOM_OFFSET : index;
            this.configModule.setConfig('theme.selected', this.selectedThemeIndex);
        }
    }

    deleteTheme(customIndex: number) {
        const selectedCustomTheme = this.customThemes[this.selectedThemeIndex - THEME_CUSTOM_OFFSET];

        // only custom themes can be deleted!
        this.customThemes.splice(customIndex, 1);
        this.configModule.setConfig('theme.custom', this.customThemes.slice());

        if (selectedCustomTheme) {
            // reset the selected index, it will be -1 when selected one was deleted
            const selectedIndex = this.customThemes.indexOf(selectedCustomTheme);

            this.configModule.setConfig(
                'theme.selected',
                selectedIndex === -1 ? -1 : selectedIndex + THEME_CUSTOM_OFFSET,
            );
        }
    }

    async ensureThemeSaved() {
        return new Promise(resolve =>
            this.configModule.app.emit('themeUnsaved', (unsaved?: Theme) => {
                if (unsaved) {
                    this.$emit(
                        'dialog',
                        this.$t('has_unsaved_theme'),
                        this.$t('save'),
                        this.$t('discard'),
                        (confirmed: boolean, canceled: boolean) => {
                            if (confirmed) {
                                if (!this.saveTheme(false)) {
                                    resolve(false);

                                    // prevent closing the dialog when failed to save
                                    return true;
                                }
                                resolve(true);
                            } else {
                                // continue only if "discard" is selected, don't do anything if user simply closes the dialog
                                resolve(canceled);
                            }
                        },
                    );
                } else {
                    resolve(true);
                }
            }),
        );
    }

    /**
     * @returns True if succeeded
     */
    saveTheme(thenSelect: boolean): boolean {
        const name = prompt(this.$t('save_theme') as string, this.$t('my_theme') as string);

        if (name) {
            const handled = this.configModule.app.emit('themeSave', name);

            if (handled) {
                if (thenSelect) {
                    this.configModule.setConfig('theme.selected', this.customThemes.length - 1 + THEME_CUSTOM_OFFSET);
                }

                return true;
            }

            error(TAG, 'Failed to save custom theme because "themeSave" event has no handler');
        }

        return false;
    }

    beforeDestroy() {
        this.configModule.app.off('config:*', this.configUpdate);
    }
}
</script>

<style scoped lang="stylus">
.themes
    padding 6px 16px 0

    >>> .progress
        background #C0392BAA !important

.action
    margin-left 16px

.delete
    position absolute
    display block
    top 0
    right 0
    background #0004
    color #FFF
    transition opacity .15s ease-out, background-color .15s ease-out, color .15s ease-out

    &:hover
        background #E74C3C

.misc
    // extra padding to prevent the dropdown of last Select component from overflowing from panel
    padding-bottom 80px
</style>
