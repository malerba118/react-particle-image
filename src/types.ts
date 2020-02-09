export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type Bounds = {
    top: number
    right: number
    bottom: number
    left: number
};

export type Dimensions = {
    width: number,
    height: number
}

export enum ImageState {
    Loading = 'Loading',
    Loaded = 'Loaded',
    Error = 'Error'
}