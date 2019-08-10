<template>
    <div id="app">
        <template v-for="(child, i) in children">
            <component :is="child" :key="i"></component>
        </template>
    </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import { Component, Ref, Vue } from 'vue-property-decorator';

@Component
export default class VueApp extends Vue {
    @Ref() readonly canvas!: HTMLCanvasElement;

    readonly children: VueConstructor[] = [];

    addChild(componentClass: VueConstructor) {
        (this.children as VueConstructor[]).push(componentClass);
    }
}
</script>
<style lang="stylus">
*
    box-sizing: border-box
    margin: 0

#canvas
    position absolute
    width 100vw
    height 100vh

#app
    height: 100vh
    background-color: #333
    color: #333
    font-family: 'Avenir', Helvetica, Arial, sans-serif
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale
</style>
