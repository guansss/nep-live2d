<template>
    <div class="settings">
        <template v-for="(setting, i) in settings">
            <component :is="setting" :key="i" ref="settings"></component>
        </template>
    </div>
</template>

<script lang="ts" src="./Settings.ts"></script>

<style scoped lang="stylus">
.settings
    max-height 100%
    overflow auto
    background-color rgba(255, 255, 255, 0.8)
    border-radius 2px
    box-shadow 0 0 2px #BBB
    font-size 16px

</style>
