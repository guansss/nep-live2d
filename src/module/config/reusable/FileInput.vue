<template>
    <div class="file-input card">
        <input :multiple="multiple" type="file" accept="image/*" @change="change" />
        <ImagePlusSVG class="svg" />
    </div>
</template>

<script lang="ts">
import ImagePlusSVG from '@/assets/img/image-plus.svg';
import Vue from 'vue';
import { Component, Model, Prop } from 'vue-property-decorator';

@Component({
    components: { ImagePlusSVG },
})
export default class FileInput extends Vue {
    @Model('change', { default: [] }) readonly files!: File[];

    @Prop({ default: false, type: Boolean }) readonly multiple!: boolean;

    change(e: Event) {
        const fileList = (e.target as HTMLInputElement).files;
        this.$emit('change', fileList ? [...fileList] : []);

        // reset the input, otherwise its "change" event will never be triggered when user selects same file(s) again
        (e.target as HTMLInputElement).value = '';
    }
}
</script>

<style scoped lang="stylus">
@require './styles'

.file-input
    position relative
    width 96px
    height 32px
    padding 4px
    background #EEE
    transition background-color .15s ease-out

    &:hover
        background #CCC

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
