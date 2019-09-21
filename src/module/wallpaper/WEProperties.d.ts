declare interface Window {
    // see http://steamcommunity.com/sharedfiles/filedetails/?id=795674740
    wallpaperRequestRandomFileForProperty?(name: string, response: (...args: any) => void): void;
}

declare interface WEProperties {
    userProps: {};

    generalProps: {};
}
