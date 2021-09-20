import { LogViewer } from "@equinor/videx-wellog";

export function removeOverlay(logViewer: LogViewer): void {
    logViewer.container.select(".overlay").remove();
    //logViewer.overlay = null;
}
