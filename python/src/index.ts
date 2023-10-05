import DashSubsurfaceViewer from "./components/DashSubsurfaceViewer";
import SubsurfaceViewer from "./components/SubsurfaceViewer";
import GroupTree from "./components/GroupTree";
import HistoryMatch from "./components/HistoryMatch";
import LeafletMap from "./components/LeafletMap";
import Map from "./components/Map";
import Morris from "./components/Morris";
import PriorPosteriorDistribution from "./components/PriorPosteriorDistribution";
import VectorSelector from "./components/VectorSelector";
import { WellCompletions } from "./components/WellCompletions";
import { VectorCalculator } from "./components/VectorCalculator";
import WellLogViewer from "./components/WellLogViewer";
import SyncLogViewer from "./components/WellLogViewer";
import WebVizContinuousLegend from "./components/ColorLegends/WebVizContinuousLegend";
import WebVizDiscreteLegend from "./components/ColorLegends/WebVizDiscreteLegend";
import WebVizColorLegend from "./components/ColorLegends/WebVizColorLegend";
import ViewAnnotation from "./components/ViewAnnotation";
import ViewFooter from "./components/ViewFooter";

export {
    HistoryMatch,
    Morris,
    Map,
    PriorPosteriorDistribution,
    LeafletMap,
    SubsurfaceViewer,
    /**
     * Component for rendering subsurface data.
     *
     * @deprecated Use the {@link SubsurfaceViewer} component instead.
     */
    SubsurfaceViewer as DeckGLMap, // For backwards compatibility
    DashSubsurfaceViewer,
    VectorSelector,
    WellCompletions,
    VectorCalculator,
    GroupTree,
    WellLogViewer,
    SyncLogViewer,
    WebVizContinuousLegend,
    WebVizDiscreteLegend,
    WebVizColorLegend,
    ViewAnnotation,
    ViewFooter,
};
