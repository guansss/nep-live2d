declare interface Window {
    // see http://steamcommunity.com/sharedfiles/filedetails/?id=795674740
    wallpaperRequestRandomFileForProperty?(name: string, response: (...args: any) => void): void;

    wallpaperPropertyListener: {
        applyUserProperties(props: WEUserProperties): void;
        applyGeneralProperties(props: WEGeneralProperties): void;

        userDirectoryFilesAddedOrChanged(propName: string, files: string[]): void;
        userDirectoryFilesRemoved(propName: string, files: string[]): void;
    };
}

declare interface WEProperty {
    value: string | number;
}

declare interface WEUserProperties {
    // make sure these are included in properties in "/assets/project-json/base.json"

    schemecolor?: WEProperty;
}

declare interface WEGeneralProperties {}

// merged user properties and general properties
declare interface WEProperties extends WEUserProperties, WEGeneralProperties {
    [name: string]: WEProperty | undefined;
}
