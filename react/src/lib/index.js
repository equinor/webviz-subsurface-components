/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import DeckGLMap from "./components/DeckGLMap";
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
import WellLogViewer from "./components/WellLogViewer";
import WebVizContinuousLegend from "./components/ColorLegends/WebVizContinuousLegend";
import WebVizDiscreteLegend from "./components/ColorLegends/WebVizDiscreteLegend";

export {
    HistoryMatch,
    Morris,
    Map,
    LayeredMap,
    PriorPosteriorDistribution,
    LeafletMap,
    DeckGLMap,
    VectorSelector,
    WellCompletions,
    VectorCalculator,
    GroupTree,
    WellLogViewer,
    WebVizContinuousLegend,
    WebVizDiscreteLegend,
};
