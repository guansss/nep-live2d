import { Subtitle } from '@/module/live2d-motion/SubtitleManager';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class VueLive2DMotion extends Vue {
    subtitles: Subtitle[] = [];
}
