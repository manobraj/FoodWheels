export declare function create(settings: any): PasswortInstance;
export declare class PasswortInstance {
    private settings;
    constructor(settings: any);
    hash(text: any): Promise<{}>;
    verify(a: any, b: any): Promise<boolean>;
}
