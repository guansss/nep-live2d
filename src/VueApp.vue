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

body
    background-color #333
    overflow hidden

ul
    list-style none

#canvas
    position absolute
    width 100vw
    height 100vh

#app
    height: 100vh
    color: #333
    font-family: 'Avenir', Helvetica, Arial, sans-serif
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale

.button
    position relative
    display inline-block
    margin-bottom 8px
    padding 8px 16px
    background-color #555
    color white
    font-size 14px
    cursor pointer
    box-shadow 0 1px 2px #0004
    transition box-shadow .15s ease-out

    &:hover
        background #222
        box-shadow 0 2px 4px #0006

    &:active
        box-shadow 0 1px 2px #0002
</style>
