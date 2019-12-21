<template>
    <div v-if="showFPS" class="fps">{{ fps }}</div>
</template>

<script lang="ts">
import Ticker from '@/core/mka/Ticker';
import ConfigModule from '@/module/config/ConfigModule';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

const FPS_REFRESH_INTERVAL = 500;

@Component
export default class Overlay extends Vue {
    @Prop() readonly configModule!: ConfigModule;

    showFPS = this.configModule.getConfig('fps', false);
    fps = 0;
    fpsIntervalId = -1;

    created() {
        if (this.showFPS) this.startFPS();

        this.configModule.app.on('config:fps', this.fpsEnabled, this);
    }

    fpsEnabled(enabled: boolean) {
        if (enabled) {
            if (!this.showFPS) this.startFPS();
        } else if (this.showFPS) {
            this.cancelFPS();
        }

        this.showFPS = enabled;
    }

    startFPS() {
        this.fpsIntervalId = window.setInterval(() => {
            this.fps = Ticker.getFPS();
        }, FPS_REFRESH_INTERVAL);
    }

    cancelFPS() {
        clearInterval(this.fpsIntervalId);
    }

    beforeDestroy() {
        this.cancelFPS();

        this.configModule.app.off('config:fps', this.fpsEnabled);
    }
}
</script>

<style scoped lang="stylus">
.fps
    position absolute
    z-index 100
    top 0
    right 0
    color #FFF
    text-shadow: 0 0 2px #555;
</style>
