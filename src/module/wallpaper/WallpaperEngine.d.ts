// make sure user properties are included in "/assets/project-json/base.json"
type WEUserPropertyNames = 'schemecolor' | WEFilePropertyNames;
type WEGeneralPropertyNames = 'language';

type WEUserProperties = Record<WEUserPropertyNames, { value: string }>;
type WEGeneralProperties = Record<WEGeneralPropertyNames, string>;

// merged user properties and general properties
type WEProperties = WEUserProperties & WEGeneralProperties;

type WEFilePropertyNames = 'imgDir' | 'vidDir';
type WEFiles = Partial<Record<WEFilePropertyNames, string[]>>;

declare interface Window {
    // see http://steamcommunity.com/sharedfiles/filedetails/?id=795674740
    wallpaperRequestRandomFileForProperty?<T extends keyof WEFilePropertyNames>(
        name: T,
        response: (...args: any) => void,
    ): void;

    wallpaperPropertyListener: {
        applyUserProperties<T extends WEUserProperties>(props: T): void;
        applyGeneralProperties<T extends WEGeneralProperties>(props: T): void;

        userDirectoryFilesAddedOrChanged<T extends keyof WEFiles>(propName: T, files: string[]): void;
        userDirectoryFilesRemoved<T extends keyof WEFiles>(propName: T, files: string[]): void;

        setPaused(paused: boolean): void;
    };
}
