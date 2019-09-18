<template>
    <img class="bg" :src="image">
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class Background extends Vue {
    @Prop({ default: '', type: String }) readonly image!: string;
}
</script>

<style scoped lang="stylus">
.bg
    display block
    width 100%
    height 100%
    object-fit cover
</style>
