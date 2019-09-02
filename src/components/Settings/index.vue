<template>
    <div class="motion-container top">
        <template v-for="(subtitle, i) in subtitles">
            <div class="subtitle-wrapper" :key="i">
                <div class="subtitle bordered" :style="subtitle.style">{{ subtitle.text }}</div>
            </div>
        </template>
    </div>
</template>

<script lang="ts" src="./Settings.ts"></script>

<style scoped lang="stylus"></style>
