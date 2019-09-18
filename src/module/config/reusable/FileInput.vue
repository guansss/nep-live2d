<template>
    <div class="file-input">
        <div class="input"></div>
        <input multiple type="file" accept="image/*" @change="$emit('change',$event)" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class FileInput extends Vue {

}
</script>

<style scoped lang="stylus"></style>
