import * as jsonpatch from "fast-json-patch";
import { isEqual } from "lodash";
import { AnyAction, Dispatch, MiddlewareAPI as Middleware } from "redux";
import { MapState } from "./store";

export const patchMiddleware = (
    setSpecPatch: (patch: jsonpatch.Operation[]) => void
) => {
    return (store: Middleware<Dispatch, MapState>) =>
        (next: Dispatch) =>
        (action: AnyAction): AnyAction => {
            const stateBef = store.getState();
            const result = next(action);

            const stateAft = store.getState();

            if (
                action.type !== "spec/setSpec" &&
                !isEqual(stateBef, stateAft)
            ) {
                const patch = jsonpatch.compare(stateBef, stateAft);
                patch.forEach((op) => {
                    //remove /spec prefix
                    op.path = op.path.substring(5);
                    const layerInfo = /\/layers\/(\d+)(\/\w+)/gm.exec(op.path);
                    if (layerInfo) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const layerId = (stateAft.spec.layers as any[])[
                            layerInfo[1]
                        ].id;
                        op.path = "/layers/[" + layerId + "]" + layerInfo[2];
                    }
                });
                setSpecPatch(patch);
            }

            return result;
        };
};
