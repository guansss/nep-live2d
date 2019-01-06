<template>
    <div id="app">
        <Settings/>
    </div>
</template>

<script>
import Settings from './components/Settings/index';

export default {
    name: 'app',
    components: {
        Settings
    }
};
</script>
<style lang="stylus">
#app
    font-family 'Avenir', Helvetica, Arial, sans-serif
    -webkit-font-smoothing antialiased
    -moz-osx-font-smoothing grayscale
    color #333
</style>
