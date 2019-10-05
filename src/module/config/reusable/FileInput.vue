<template>
    <div class="file-input">
        <input :multiple="multiple" type="file" :accept="accept" @change="change" />
        <PlusSVG class="svg" />
    </div>
</template>

<script lang="ts">
import PlusSVG from '@/assets/img/plus.svg';
import Vue from 'vue';
import { Component, Model, Prop } from 'vue-property-decorator';

@Component({
    components: { PlusSVG },
})
export default class FileInput extends Vue {
    @Model('change', { default: undefined }) readonly files!: File[] | File | null;

    @Prop({ default: false, type: Boolean }) readonly multiple!: boolean;
    @Prop({ default: '', type: String }) readonly accept!: string;

    change(e: Event) {
        const input = e.target as HTMLInputElement;
        const files = input.files || [];

        this.$emit('change', this.multiple ? [...files] : files[0] || null);

        // reset the input, otherwise its "change" event will never be triggered when user selects same file(s) again
        input.value = '';
    }
}
</script>

<style scoped lang="stylus">
@require './styles'

.file-input
    position relative
    width 96px
    height 32px
    padding 16%

    input
        position absolute
        display block
        top 0
        left 0
        width 100%
        height 100%
        opacity 0
        font-size 0
        cursor pointer

.svg
    width 100%
    height 100%
</style>
