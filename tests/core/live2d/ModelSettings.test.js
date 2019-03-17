import ModelSettings from '@/core/live2d/ModelSettings';

const MODEL_SETTINGS_FILE = '../../../wallpaper/live2d/neptune/normal.model.json';
const MODEL_BASE_PATH = 'http://localhost/model/';

// prevent logging
console.log = jest.fn();

it('should load from JSON', () => {
    let modelSettingsJson;

    try {
        modelSettingsJson = require(MODEL_SETTINGS_FILE);
    } catch (e) {
        console.warn('Cannot find model settings file, test will be skipped.');
        return;
    }

    const modelSettings = new ModelSettings(modelSettingsJson, MODEL_BASE_PATH);

    expect(modelSettings.hitAreas).toBeInstanceOf(Array);
    expect(modelSettings.hitAreas.length).toBeGreaterThan(0);
    expect(modelSettings.motions.idle[0].fadeIn).toBe(2000);

    expect(modelSettings.model).toMatch(/** @type {RegExp} */ new RegExp(`^${MODEL_BASE_PATH}.+?\\.moc`));
});
