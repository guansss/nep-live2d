<template>
    <div :class="['select', { opened }]">
        <div class="label">
            <slot />
        </div>

        <div class="control" v-on-clickaway="close">
            <div class="panel">
                <div ref="dropdown" class="dropdown">
                    <ul v-if="opened" ref="options" class="options">
                        <li v-for="option in options" :key="option.text"
                            :class="['option', { selected: option.value === value }]"
                            @click="select(option)">{{ option.text }}
                        </li>
                    </ul>
                </div>
            </div>
            <div class="selection" @click="toggleOpen">{{ selection }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { directive as onClickaway } from 'vue-clickaway';
import { Component, Model, Prop, Ref } from 'vue-property-decorator';

export interface Option {
    text: string,
    value: any
}

@Component({
    directives: { onClickaway },
})
export default class Select extends Vue {
    @Prop({ type: Array, default: [] }) readonly options!: readonly Option[];

    @Model('change', { default: null }) value!: any;

    @Ref('dropdown') readonly dropdownEl!: HTMLDivElement;
    @Ref('options') readonly optionsEl!: HTMLUListElement;

    opened = false;
    animating = false;

    get selection() {
        const selected = this.options.find(option => option.value === this.value);
        return selected ? selected.text : '';
    }

    select(option: Option) {
        this.$emit('change', option.value);
        this.close();
    }

    toggleOpen() {
        this.opened ? this.close() : this.open();
    }

    async open() {
        if (!this.opened && !this.animating) {
            this.opened = true;

            await this.$nextTick();

            if (this.dropdownEl && this.optionsEl) {
                this.animating = true;

                const height = this.optionsEl.offsetHeight + 'px';

                this.dropdownEl.animate([{
                    height: 0,
                    opacity: 0,
                }, {
                    height: height,
                    opacity: 1,
                }], {
                    duration: 150,
                    easing: 'ease-out',
                    fill: 'forwards',
                })
                    .onfinish = () => this.animating = false;
            }
        }
    }

    async close() {
        if (this.opened && !this.animating) {
            if (this.dropdownEl) {
                this.animating = true;

                this.dropdownEl.animate([{
                    height: this.dropdownEl.offsetHeight + 'px',
                    opacity: 1,
                }, {
                    height: 0,
                    opacity: 0,
                }], {
                    duration: 150,
                    easing: 'ease-out',
                    fill: 'forwards',
                })
                    .onfinish = () => {
                    this.opened = false;
                    this.animating = false;
                };
            } else {
                this.opened = false;
            }
        }
    }
}
</script>

<style scoped lang="stylus">
@require './vars'

$height = 32px
$padding = 8px

.select
    width 240px
    padding 16px
    display flex
    align-items center

    &.opened
        .control:after
            transform rotate(180deg)

        .selection
            border-bottom-color #0001

.control
    position relative
    flex-grow 1
    max-width 240px
    height $height
    font-size $height - $padding * 2 - 2
    cursor pointer

    &:after
        content ''
        position absolute
        top $padding + 5px
        right ($padding / 2)
        border-top solid 5px #EEE
        border-right solid 4px transparent
        border-left solid 4px transparent
        transition transform .15s ease-out

.panel
    position absolute
    margin 0
    top 0
    right 0
    left 0
    padding $height 0 0 0
    background #EEE
    color #333
    box-shadow 0 1px 2px #0004

.selection
    position absolute
    width 100%
    height $height
    padding $padding ($padding * 2) $padding $padding
    overflow hidden
    background $themeColor
    color #EEE
    line-height $height - $padding * 2
    white-space nowrap
    text-overflow ellipsis
    border-bottom 1px solid transparent
    transition background-color .15s ease-out, border-bottom-color .15s ease-out

    &:hover
        background darken($themeColor, 30%)

.dropdown
    position relative
    top 100%
    right 0
    left 0
    overflow hidden

.options
    position absolute
    bottom 0
    width 100%
    background #F6F6F6

.option
    padding $padding
    transition background-color .15s ease-out

    &.selected
        background #DDD

    &:hover
        background #CCC
</style>
