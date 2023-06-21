import { scaleLinear, scaleLog } from "d3";
import { Scale, Domain } from "@equinor/videx-wellog/dist/common/interfaces";

/**
 * Creates a d3 scale from config
 */
export function createScale(type: string, domain: Domain): Scale {
    if (type === "linear") {
        return scaleLinear().domain(domain) as Scale;
    }
    if (type === "log") {
        return scaleLog().domain(domain) as Scale;
    }
    throw Error("Invalid input!");
}
