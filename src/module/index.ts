import { ModuleConstructor } from '@/App';
import BackgroundModule from '@/module/background/BackgroundModule';
import ConfigModule from '@/module/config/ConfigModule';
import LeavesModule from '@/module/leaves/LeavesModule';
import Live2DEventModule from '@/module/live2d-event/Live2DEventModule';
import Live2DMotionModule from '@/module/live2d-motion/Live2DMotionModule';
import Live2DModule from '@/module/live2d/Live2DModule';
import SnowModule from '@/module/snow/SnowModule';
import ThemeModule from '@/module/theme/ThemeModule';
import WallpaperModule from '@/module/wallpaper/WallpaperModule';

export default [
    ConfigModule,
    BackgroundModule,
    Live2DModule,
    LeavesModule,
    SnowModule,
    Live2DEventModule,
    Live2DMotionModule,
    WallpaperModule,
    ThemeModule,
] as ModuleConstructor[];
