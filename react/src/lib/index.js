/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import SubsurfaceViewer, {
    DashSubsurfaceViewer,
} from "./components/SubsurfaceViewer";
import GroupTree from "./components/GroupTree";
import HistoryMatch from "./components/HistoryMatch";
import LayeredMap from "./components/LayeredMap";
import LeafletMap from "./components/LeafletMap";
import Map from "./components/Map";
import Morris from "./components/Morris";
import PriorPosteriorDistribution from "./components/PriorPosteriorDistribution";
import VectorSelector from "./components/VectorSelector";
import WellCompletions from "./components/WellCompletions";
import { VectorCalculator } from "./components/VectorCalculator";
import { WellLogViewer } from "./components/WellLogViewer";
import { SyncLogViewer } from "./components/WellLogViewer";
import WebVizContinuousLegend from "./components/ColorLegends/WebVizContinuousLegend";
import WebVizDiscreteLegend from "./components/ColorLegends/WebVizDiscreteLegend";
import WebVizColorLegend from "./components/ColorLegends/WebVizColorLegend";
import { PickInfo, View } from "deck.gl";
import { TooltipCallback } from "./components/SubsurfaceViewer/components/Map";
import {
    ExtendedLayerProps,
    PropertyDataType,
    LayerPickInfo,
} from "./components/SubsurfaceViewer/layers/utils/layerTools";
import { WellsPickInfo } from "./components/SubsurfaceViewer/layers/wells/wellsLayer";
import TerrainMapPickInfo from "./components/SubsurfaceViewer/layers/terrain/terrainMapLayer";
import { FeatureCollection } from "@nebula.gl/edit-modes";
import { ViewFooter } from "./components/SubsurfaceViewer/components/ViewFooter";
import { ViewAnnotation } from "./components/SubsurfaceViewer/components/ViewAnnotation";

export {
    HistoryMatch,
    Morris,
    Map,
    LayeredMap,
    PriorPosteriorDistribution,
    LeafletMap,
    SubsurfaceViewer,
    /**
     * Component for rendering subsurface data.
     *
     * @deprecated Use the {@link SubsurfaceViewer} component instead.
     */
    SubsurfaceViewer as DeckGLMap, // For backwards compatibility
    VectorSelector,
    WellCompletions,
    VectorCalculator,
    GroupTree,
    WellLogViewer,
    SyncLogViewer,
    WebVizContinuousLegend,
    WebVizDiscreteLegend,
    WebVizColorLegend,
    PickInfo,
    TooltipCallback,
    ExtendedLayerProps,
    PropertyDataType,
    WellsPickInfo,
    TerrainMapPickInfo,
    FeatureCollection,
    LayerPickInfo,
    ViewFooter,
    View,
    DashSubsurfaceViewer,
    ViewAnnotation,
};
