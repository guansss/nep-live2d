<template>
    <div id="app">
        <img class="bg" :src="backgroundImage" />
        <component :is="child" :key="child.name"></component>
    </div>
</template>

<script lang="ts">
import Mka from '@/core/mka';
import Vue, { VueConstructor } from 'vue';

export default Vue.extend({
    name: 'app',
    components: {},
    data: () => ({
        backgroundImage: '',
        children: [],
    }),
    created() {
        const mka = new Mka(this.$refs.canvas as HTMLCanvasElement);

        this.mka = mka;
    },
    mounted() {
        this.backgroundImage = '/image/bg_forest.jpg';
    },
    methods: {
        addChild(componentClass: VueConstructor) {
            (this.children as VueConstructor[]).push(componentClass);
        },
    },
    beforeDestroy() {
        if (this.mka) {
            this.mka.destroy();
        }
    },
});
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
