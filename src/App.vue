<template>
    <div id="app">
        <Settings />
        <div ref="canvas"></div>
    </div>
</template>

<script>
import Settings from './components/Settings/index';
import * as PIXI from 'pixi.js';
import 'pixi-live2d/src';

export default {
    name: 'app',
    components: {
        Settings
    },
    async mounted() {
        const modelJson = 'live2d/neptune/normal.model.json';

        const renderer = new PIXI.WebGLRenderer(800, 600);
        this.$refs.canvas.appendChild(renderer.view);
        const stage = new PIXI.Container();

        const live2dSprite = new PIXI.Live2DSprite(modelJson);
        stage.addChild(live2dSprite);

        live2dSprite.startRandomMotion('idle');
        live2dSprite.on('mousemove', evt => {
            const point = evt.data.global;
            live2dSprite.setViewPoint(point.x, point.y);
        });

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(stage);
        }

        animate();
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
