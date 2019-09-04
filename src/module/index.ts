import { ModuleConstructor } from '@/App';
import ConfigModule from '@/module/config';
import Live2DModule from '@/module/live2d';
import Live2DEventModule from '@/module/live2d-event';
import Live2DMotionModule from '@/module/live2d-motion';

export default [ConfigModule, Live2DModule, Live2DEventModule, Live2DMotionModule] as ModuleConstructor[];
