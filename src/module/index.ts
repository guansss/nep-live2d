import { ModuleConstructor } from '@/App';
import BackgroundModule from '@/module/background';
import ConfigModule from '@/module/config';
import Live2DModule from '@/module/live2d';
import Live2DEventModule from '@/module/live2d-event';
import Live2DMotionModule from '@/module/live2d-motion';
import SnowModule from '@/module/snow';

export default [ConfigModule, BackgroundModule, Live2DModule, SnowModule, Live2DEventModule, Live2DMotionModule] as ModuleConstructor[];
