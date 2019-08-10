<template>
    <div id="app">
        <canvas ref="canvas"></canvas>
        <template v-for="(child, i) in children">
            <component :is="child" :key="i"></component>
        </template>
    </div>
</template>

<script lang="ts">
import Mka from '@/core/mka';
import { VueConstructor } from 'vue';
import { Component, Ref, Vue } from 'vue-property-decorator';

@Component
export default class VueApp extends Vue {
    @Ref() readonly canvas!: HTMLCanvasElement;

    readonly children: VueConstructor[] = [];

    mka!: Mka;

    addChild(componentClass: VueConstructor) {
        (this.children as VueConstructor[]).push(componentClass);
    }

    created() {
        this.mka = new Mka(this.canvas);
    }

    beforeDestroy() {
        this.mka.destroy();
    }
}
</script>
<style lang="stylus">
*
    box-sizing: border-box
    margin: 0

#app
    height: 100vh
    background-color: #333
    color: #333
    font-family: 'Avenir', Helvetica, Arial, sans-serif
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale

.bg
    display: block
    width: 100%
    height: 100%
</style>
