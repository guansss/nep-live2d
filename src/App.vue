<template>
    <div id="app">
        <Settings />
        <div ref="canvas"></div>
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
};
</script>
<style lang="stylus">
#app
    font-family 'Avenir', Helvetica, Arial, sans-serif
    -webkit-font-smoothing antialiased
    -moz-osx-font-smoothing grayscale
    color #333
</style>
