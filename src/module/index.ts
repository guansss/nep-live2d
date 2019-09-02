import { ModuleConstructor } from '@/App';
import Live2DModule from '@/module/live2d';
import Live2DEventModule from '@/module/live2d-event';
import Live2DMotionModule from '@/module/live2d-motion';

export default [Live2DModule, Live2DEventModule, Live2DMotionModule] as ModuleConstructor[];
