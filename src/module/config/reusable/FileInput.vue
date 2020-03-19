<template>
    <div class="file-input">
        <input :multiple="multiple" type="file" :accept="accept" :webkitdirectory="directory" @change="change" />
        <FolderPlusSVG v-if="directory" class="svg" />
        <FilePlusSVG v-else class="svg" />
    </div>
</template>

<script lang="ts">
import FilePlusSVG from '@/assets/img/file-plus.svg';
import FolderPlusSVG from '@/assets/img/folder-plus.svg';
import Vue from 'vue';
import { Component, Model, Prop } from 'vue-property-decorator';

@Component({
    components: { FilePlusSVG, FolderPlusSVG },
})
export default class FileInput extends Vue {
    @Model('change', { default: undefined }) readonly files!: File[];

    @Prop({ default: false, type: Boolean }) readonly multiple!: boolean;
    @Prop({ default: false, type: Boolean }) readonly directory!: boolean;
    @Prop({ default: '', type: String }) readonly accept!: string;

    change(e: Event) {
        const input = e.target as HTMLInputElement;

        // always return an array regardless of `multiple` option
        this.$emit('change', input.files ? [...input.files] : []);

        // reset the input, otherwise its "change" event will never be triggered when user selects same file(s) again
        input.value = '';
    }
}
</script>

<style scoped lang="stylus">
@require './vars'

.file-input
    position relative

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
