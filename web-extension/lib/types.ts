export interface OCRRegion {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface OCRResponse {
    regions: OCRRegion[];
}

export interface Point {
    x: number;
    y: number;
}

export interface Selection {
    x: number;
    y: number;
    width: number;
    height: number;
}