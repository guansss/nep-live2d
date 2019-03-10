import ModelSettings from '@/core/live2d/ModelSettings';

const MODEL_SETTINGS_FILE = '../../../wallpaper/live2d/neptune/normal.model.json';

it('loads from JSON', () => {
    let modelSettingsJson;

    try {
        modelSettingsJson = require(MODEL_SETTINGS_FILE);
    } catch (e) {
        console.warn('Cannot find model settings file, test will be skipped.');
        return;
    }

    const modelSettings = ModelSettings.fromJSON(modelSettingsJson);

    expect(modelSettings.hitAreas).toBeInstanceOf(Array);
    expect(modelSettings.hitAreas.length).toBeGreaterThan(0);
    expect(modelSettings.motions.idle[0].fadeIn).toBe(2000);
});
