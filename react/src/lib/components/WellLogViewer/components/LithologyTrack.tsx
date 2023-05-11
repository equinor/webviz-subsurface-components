import { StackedTrackOptions } from "@equinor/videx-wellog/dist/tracks/stack/interfaces";
import { Scale } from "@equinor/videx-wellog/dist/common/interfaces";
import { setProps, StackedTrack } from "@equinor/videx-wellog";
import {
    OnMountEvent,
    OnRescaleEvent,
    OnUpdateEvent,
} from "@equinor/videx-wellog/dist/tracks/interfaces";
import { select } from "d3-selection";

interface RGBColor {
    r: number;
    g: number;
    b: number;
    a?: number;
}

interface LithologyTrackDataRow {
    from: number;
    to: number;
    name?: string | number;
    color?: RGBColor;
}

// TODO: change to more map/dict structure? (keys correspond to data values)
// {
//    1: {name: string, imagePath: string, color: RGBColor},
//    32: {name: string, imagePath: string, color: RGBColor},
// }
export interface LithologyInfoTable {
    codes: (string | number)[];
    names: string[]; // For writing on track
    secondaryNames?: string[];
    images?: string[];
    colors?: ([number, number, number, number] | [number, number, number])[];
}

// As LithologyTrack subclasses StackedTrack which has "data: Promise<any> | Function | any;", include "any" as type to avoid problems when using class
export interface LithologyTrackOptions extends StackedTrackOptions {
    lithologyInfoTable?: LithologyInfoTable;
    /* eslint-disable */
    data?: LithologyTrackDataRow[] | Promise<LithologyTrackDataRow> | any;
}

export class LithologyTrack extends StackedTrack {
    lithologyInfo: LithologyInfoTable;
    patterns: Map<string | number, CanvasPattern | string>; // TODO: fix type
    ctx: CanvasRenderingContext2D | undefined;

    constructor(id: string | number, props: LithologyTrackOptions) {
        super(id, props);
        this.lithologyInfo = props.lithologyInfoTable as LithologyInfoTable; // TODO - ensure table is given and valid
        setupLithologyInfoMap(this.lithologyInfo);
        this.patterns = new Map<string | number, CanvasPattern | string>();
        this.loadPatterns = this.loadPatterns.bind(this);
    }

    async loadPatterns():Promise<void> {
        return new Promise<void>(resolve => {
            const { data } = this;
            if (!data) return;
            // Find unique canvas code names in data for this track. Later only load images for used codes
            const uniqueCodes = [
                ...new Set(data.map((item: LithologyTrackDataRow) => item.name)),
            ] as (string | number)[]; // TODO: why doesn't typescript understand this itself?

            let numUniquePatternsLoading = uniqueCodes.length;
            uniqueCodes.forEach((code) => {
                const pattern = lithologyInfoMap.get(code);
                // const pattern = patterns.find(pattern => code === pattern.code)
                if (pattern?.patternImage) {
                    // Check if we have loaded pattern
                    if (!this.patterns.get(code)) {
                        // Temporarily set solid color while we get image to avoid fetching multiple times
                        this.patterns.set(code, "#eee");
                        // Create pattern
                        const patternImage = new Image();
                        patternImage.src = pattern.patternImage;
                        patternImage.onload = () => {
                            this.patterns.set(
                                code,
                                this.ctx?.createPattern(
                                    patternImage,
                                    "repeat"
                                ) as CanvasPattern
                            );
                            numUniquePatternsLoading -= 1;
                            // Resolve on last image.
                            if (numUniquePatternsLoading <= 0) {
                              this.isLoading = false;
                              resolve();
                            }
                        };
                    } else {
                        numUniquePatternsLoading -= 1;
                    }
                } else {
                    numUniquePatternsLoading -= 1;
                }
            });
            if (numUniquePatternsLoading <= 0) {
              this.isLoading = false;
              resolve();
            }
        })
    }

    plot(): void {
        const { ctx, scale: yscale, data, patterns } = this;
        if (!ctx || !data) return;
        const rectangles = scaleData(yscale, data);
        const { width: rectWidth, clientWidth, clientHeight } = ctx.canvas;
        ctx.clearRect(0, 0, clientWidth, clientHeight);
        rectangles.forEach((rectangle: LithologyTrackDataRowScaled) => {
            // Save/restore to move the pattern, if not the pattern will look odd when scrolling
            ctx.save();
            // Translate context to draw position
            ctx.translate(0, rectangle.yFrom);

            const nameColorPattern = lithologyInfoMap.get(
                rectangle.lithologyCode
            );
            // Draw rect at the origin of the context
            const rectHeight = rectangle.yTo - rectangle.yFrom;

            // Background color
            // Color from colorImageName map input, not from data originating from overall colormaps input!
            ctx.fillStyle = `rgb(${nameColorPattern?.color?.r}, ${nameColorPattern?.color?.g},${nameColorPattern?.color?.b})`; // `rgb(${rectangle.color.r}, ${rectangle.color.g},${rectangle.color.b})`;
            ctx.fillRect(0, 0, rectWidth, rectHeight);
            // Pattern
            ctx.fillStyle = patterns.get(rectangle.lithologyCode) || "#eee";
            ctx.fillRect(0, 0, rectWidth, rectHeight);

            // Overlay color for text
            const fractionTextWidth = 0.2;
            ctx.fillStyle = `rgb(${nameColorPattern?.color?.r}, ${nameColorPattern?.color?.g},${nameColorPattern?.color?.b})`;
            ctx.fillRect(
                rectWidth * 0.5,
                0,
                rectWidth * fractionTextWidth,
                rectHeight
            );
            ctx.restore();

            ctx.save();
            // Rotate before adding text
            ctx.translate(
                rectWidth * 0.5 + rectWidth * fractionTextWidth * 0.1,
                rectangle.yFrom + rectHeight / 2
            );
            ctx.rotate(Math.PI / 2);
            ctx.textAlign = "center";
            ctx.font = `bold ${0.9 * rectWidth * fractionTextWidth}px serif`; //"bold 10px serif";
            ctx.fillText(
                `${nameColorPattern?.lithologyName}`,
                0,
                fractionTextWidth / 2,
                rectHeight
            );
            ctx.restore();
        });
    }

    onMount(trackEvent: OnMountEvent): void {
        super.onMount(trackEvent);
        const canvas = select(trackEvent.elm)
            .append("canvas")
            .style("position", "absolute");
        this.ctx = canvas.node()?.getContext("2d") ?? undefined;
        const { options } = this;
        if (options.data) {
            options.data().then(
                (data: LithologyTrackDataRow[]) => {
                    this.data = data;
                    // @ts-ignore
                    this.loadPatterns().then(this.plot());
                },
                (error: Error | string) => super.onError(error)
            );
        }
    }

    onRescale(rescaleEvent: OnRescaleEvent): void {
        super.onRescale(rescaleEvent);
        this.plot();
    }

    onUpdate(event: OnUpdateEvent): void {
        super.onUpdate(event);
        const { ctx, elm } = this;

        if (ctx) {
            const canvas = select(ctx.canvas);
            const props = {
                styles: {
                    width: `${elm.clientWidth}px`,
                    height: `${elm.clientHeight}px`,
                },
                attrs: {
                    width: elm.clientWidth,
                    height: elm.clientHeight,
                },
            };
            setProps(canvas, props);
        }
        this.plot();
    }
    onDataLoaded(): void {
        // @ts-ignore
        this.loadPatterns().then(this.plot());
    }
}

interface LithologyTrackDataRowScaled {
    yFrom: number;
    yTo: number;
    lithologyCode: number | string;
    color: RGBColor;
}

function scaleData(scale: Scale, data: LithologyTrackDataRow[]) {
    if (!data) return [];

    function scale_to_and_from_depths(
        rect: LithologyTrackDataRowScaled[],
        item: LithologyTrackDataRow
    ) {
        rect.push({
            yFrom: scale(item.from),
            yTo: scale(item.to),
            lithologyCode: item.name as number | string,
            color: item.color as RGBColor,
        });
        return rect as LithologyTrackDataRowScaled[];
    }
    return data.reduce(
        scale_to_and_from_depths,
        [] as LithologyTrackDataRowScaled[]
    );
}

// Map that all tracks may use, not belonging to a specific track instance
const lithologyInfoMap = new Map<string | number, PatternMapEntry>();

interface PatternMapEntry {
    code: string | number;
    patternImage: string;
    lithologyName?: string;
    color?: { r: number; g: number; b: number };
}

function setupLithologyInfoMap(lithologyInfo: LithologyInfoTable) {
    lithologyInfo.codes.map((e, i) => {
        if (!lithologyInfoMap.has(e)) {
            lithologyInfoMap.set(e, {
                code: e,
                lithologyName: lithologyInfo.names[i],
                patternImage: lithologyInfo.images
                    ? lithologyInfo.images[i]
                    : undefined,
                color: lithologyInfo.colors
                    ? {
                          r: lithologyInfo.colors[i][0],
                          g: lithologyInfo.colors[i][1],
                          b: lithologyInfo.colors[i][2],
                      }
                    : undefined,
            } as PatternMapEntry);
        }
    });
}
