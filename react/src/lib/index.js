/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import SubsurfaceViewer, {
    SubsurfaceViewerDashWrapper,
} from "./components/DeckGLMap";
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
import { PickInfo, View } from "deck.gl";
import { TooltipCallback } from "./components/DeckGLMap/components/Map";
import {
    ExtendedLayerProps,
    PropertyDataType,
    LayerPickInfo,
} from "./components/DeckGLMap/layers/utils/layerTools";
import { WellsPickInfo } from "./components/DeckGLMap/layers/wells/wellsLayer";
import TerrainMapPickInfo from "./components/DeckGLMap/layers/terrain/terrainMapLayer";
import { FeatureCollection } from "@nebula.gl/edit-modes";
import { ViewFooter } from "./components/DeckGLMap/components/ViewFooter";

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
    SubsurfaceViewerDashWrapper,
};
