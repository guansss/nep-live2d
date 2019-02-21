<template>
    <div id="app">
        <Settings v-if="false" />
        <div ref="canvas"></div>
        <img ref="bg" class="bg" src="" />
    </div>
</template>

<script>
import Settings from './components/Settings/index';
import Mka from '@/core/mka';
import * as players from '@/core/players';

export default {
    name: 'app',
    components: {
        Settings,
    },
    created() {
        const mka = new Mka(this.$refs.canvas);

        Object.entries(players).forEach(([name, player]) => mka.addPlayer(name, player));
    },
    mounted() {
        this.$refs.bg.src = '/image/bg_forest.jpg';
    },
};
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
