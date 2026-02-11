import { PathString, URLString } from '@battis/descriptive-types';
export declare const pattern: RegExp;
export declare function parse(url: URL | URLString): {
    url: import("node:url").URL;
    protocol: string;
    hostname: string;
    port: number;
    path: string;
};
export declare function path(url: URL | URLString): PathString;
export declare function port(url: URL | URLString): number;
