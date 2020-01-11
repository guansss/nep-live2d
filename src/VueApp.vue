<template>
    <div id="app">
        <canvas id="canvas" ref="canvas"></canvas>
        <template v-for="(child, i) in children">
            <component :is="child.component" :key="i" ref="children" v-bind="child.props"></component>
        </template>
    </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import { Component, Ref, Vue } from 'vue-property-decorator';

@Component
export default class VueApp extends Vue {
    @Ref('canvas') readonly canvas!: HTMLCanvasElement;
    @Ref('children') readonly childrenRef!: Vue[];

    readonly children: {
        component: VueConstructor;
        props?: any;
    }[] = [];

    async addChild(componentClass: VueConstructor, props?: any) {
        const index = this.children.length;
        this.children.push({
            component: componentClass,
            props,
        });

        await this.$nextTick();
        return this.childrenRef[index];
    }
}
</script>
<style lang="stylus">
*
    box-sizing border-box
    margin 0
    padding 0

html
body
    height 100%

body
    padding var(--safeTop, 0) var(--safeRight, 0) var(--safeBottom, 0) var(--safeLeft, 0)
    background-color #333
    overflow hidden

ul
    list-style none

pre
    font-family Consolas, monospace

#canvas
    position absolute
    width 100%
    height 100%

#app
    position relative
    height 100%
    color: #333
    font-family: 'Avenir', Helvetica, Arial, 'Microsoft Yahei UI'
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale
</style>
