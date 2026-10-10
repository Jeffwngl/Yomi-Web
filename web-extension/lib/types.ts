export interface OCRRegion {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface OCRResponse {
    regions: OCRRegion[];
    reason: string | null;
    valid: boolean;
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
