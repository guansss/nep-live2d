import { ModuleConstructor } from '@/App';
import BackgroundModule from '@/module/background/BackgroundModule';
import ConfigModule from '@/module/config/ConfigModule';
import Live2DEventModule from '@/module/live2d-event/Live2DEventModule';
import Live2DMotionModule from '@/module/live2d-motion/Live2DMotionModule';
import Live2DModule from '@/module/live2d/Live2DModule';
import SnowModule from '@/module/snow/SnowModule';
import WallpaperModule from '@/module/wallpaper/WallpaperModule';

export default [
    ConfigModule,
    BackgroundModule,
    Live2DModule,
    SnowModule,
    Live2DEventModule,
    Live2DMotionModule,
    WallpaperModule,
] as ModuleConstructor[];
