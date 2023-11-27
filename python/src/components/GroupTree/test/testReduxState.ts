import type { UISettings } from "../redux/types";

export const testState = {
    id: "test",
    ui: {
        currentDateTime: "2018-02-01",
        currentFlowRate: "waterrate",
        currentNodeInfo: "pressure",
    } as UISettings,
};
