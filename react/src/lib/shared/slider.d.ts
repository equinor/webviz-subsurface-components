/**
 * Generic D3 based slider. Fixed to a discrete number of steps.
 * Emits an event every at the end of every slide event, with the selected step index.
 * The slider control will snap to the nearest valid step.
 */
export default class Slider extends Component {
    constructor(config: any);
    parentElement: any;
    data: any;
    numberOfVisibleTicks: any;
    length: any;
    width: any;
    position: any;
    orientation: any;
    dimension: any;
    axis: any;
    selectedIndex: any;
    hideCurrentTick: any;
    currentValuePosition: any;
    ticksPosition: any;
    render(): void;
    init(): void;
    scale: d3.ScaleLinear<number, number, never> | undefined;
    renderContainer(): void;
    container: any;
    renderLine(): void;
    slideMove(pos: any): void;
    slideEnd(pos: any): void;
    renderTicks(): void;
    renderCurrentTick(): void;
    _calculateTickProperties(position: any): {
        transform: string;
        "text-anchor": string;
        "dominant-baseline": string;
    };
    renderHandle(): void;
    bar: any;
    setData(data: any): void;
    update(): void;
}
import Component from "./component";
import * as d3 from "d3";
