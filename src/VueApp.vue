<template>
    <div id="app">
        <canvas id="canvas" ref="canvas"></canvas>
        <template v-for="(child, i) in children">
            <component :is="child" :key="i" ref="children"></component>
        </template>
        <Settings />
    </div>
</template>

<script lang="ts">
import Settings from '@/components/Settings/Settings';
import { VueConstructor } from 'vue';
import { Component, Ref, Vue } from 'vue-property-decorator';

@Component({
    components: { Settings },
})
export default class VueApp extends Vue {
    @Ref('canvas') readonly canvas!: HTMLCanvasElement;

    readonly children: VueConstructor[] = [];

    async addChild(componentClass: VueConstructor) {
        const index = this.children.length;
        this.children.push(componentClass);

        await this.$nextTick();
        return (this.$refs.children as Vue[])[index];
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
