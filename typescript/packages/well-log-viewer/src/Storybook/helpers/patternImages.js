import Anhydrite from "../../../../../../example-data/patterns/Anhydrite.gif";
import Bitumenious from "../../../../../../example-data/patterns/Bitumenious.gif";
import Browncoal from "../../../../../../example-data/patterns/Browncoal.gif";
import CalcareousDolostone from "../../../../../../example-data/patterns/Calcareous_dolostone.gif";
import Chalk from "../../../../../../example-data/patterns/Chalk.gif";
import Clay from "../../../../../../example-data/patterns/Clay.gif";
import Coal from "../../../../../../example-data/patterns/Coal.gif";
import Conglomerate from "../../../../../../example-data/patterns/Conglomerate.gif";
import DiamondLines from "../../../../../../example-data/patterns/Diamond_lines.gif";
import DolomiticLimestone from "../../../../../../example-data/patterns/Dolomitic_limestone.gif";
import Dolostone from "../../../../../../example-data/patterns/Dolostone.gif";
import DownwardLines from "../../../../../../example-data/patterns/Downward_lines.gif";
import DykesAndSills from "../../../../../../example-data/patterns/Dykes_and_sills.gif";
import EmptyFile from "../../../../../../example-data/patterns/EmptyFile.gif";
import FissileMud from "../../../../../../example-data/patterns/Fissile_mud.gif";
import FissileSilt from "../../../../../../example-data/patterns/Fissile_silt.gif";
import GridLines from "../../../../../../example-data/patterns/Grid_lines.gif";
import Gypsum from "../../../../../../example-data/patterns/Gypsum.gif";
import GypsumAnhydriteUnspecified from "../../../../../../example-data/patterns/Gypsum_anhydrite_unspecified.gif";
import Halite from "../../../../../../example-data/patterns/Halite.gif";
import HorizontalDashed from "../../../../../../example-data/patterns/Horizontal_dashed.gif";
import HorizontalLines from "../../../../../../example-data/patterns/Horizontal_lines.gif";
import Intrusive from "../../../../../../example-data/patterns/Intrusive.gif";
import Limestone from "../../../../../../example-data/patterns/Limestone.gif";
import MaficPlutonic from "../../../../../../example-data/patterns/Mafic_plutonic.gif";
import Marl from "../../../../../../example-data/patterns/Marl.gif";
import Metamorphic from "../../../../../../example-data/patterns/Metamorphic.gif";
import Mud from "../../../../../../example-data/patterns/Mud.gif";
import Raster from "../../../../../../example-data/patterns/Raster.gif";
import SaltGeneral from "../../../../../../example-data/patterns/Salt_general.gif";
import Sand from "../../../../../../example-data/patterns/Sand.gif";
import SedimentBreccia from "../../../../../../example-data/patterns/Sediment_breccia.gif";
import Shale from "../../../../../../example-data/patterns/Shale.gif";
import SilicicPlutonic from "../../../../../../example-data/patterns/Silicic_plutonic.gif";
import Silt from "../../../../../../example-data/patterns/Silt.gif";
import Tuffitt from "../../../../../../example-data/patterns/Tuffitt.gif";
import UpwardLines from "../../../../../../example-data/patterns/Upward_lines.gif";
import VerticalBitumenious from "../../../../../../example-data/patterns/Vertical_bitumenious.gif";
import VerticalCalcareousDolostone from "../../../../../../example-data/patterns/Vertical_calcareous_dolostone.gif";
import VerticalChalk from "../../../../../../example-data/patterns/Vertical_chalk.gif";
import VerticalClaystone from "../../../../../../example-data/patterns/Vertical_claystone.gif";
import VerticalDashed from "../../../../../../example-data/patterns/Vertical_dashed.gif";
import VerticalDolomiticLimestone from "../../../../../../example-data/patterns/Vertical_dolomitic_limestone.gif";
import VerticalDolostone from "../../../../../../example-data/patterns/Vertical_dolostone.gif";
import VerticalFissileMudstone from "../../../../../../example-data/patterns/Vertical_fissile_mudstone.gif";
import VerticalFissileSiltstone from "../../../../../../example-data/patterns/Vertical_fissile_siltstone.gif";
import VerticalLimestone from "../../../../../../example-data/patterns/Vertical_limestone.gif";
import VerticalLines from "../../../../../../example-data/patterns/Vertical_lines.gif";
import VerticalMarl from "../../../../../../example-data/patterns/Vertical_marl.gif";
import VerticalShale from "../../../../../../example-data/patterns/Vertical_shale.gif";
import VerticalTuffitt from "../../../../../../example-data/patterns/Vertical_tuffitt.gif";
import Vulcanic from "../../../../../../example-data/patterns/Vulcanic.gif";

const imagesAndNames = Object.freeze([
    { img: Anhydrite, name: "Anhydrite" },
    { img: Bitumenious, name: "Bitumenious" },
    { img: Browncoal, name: "Browncoal" },
    { img: CalcareousDolostone, name: "Calcareous Dolostone" },
    { img: Chalk, name: "Chalk" },
    { img: Clay, name: "Clay" },
    { img: Coal, name: "Coal" },
    { img: Conglomerate, name: "Conglomerate" },
    { img: DiamondLines, name: "Diamond_lines" },
    { img: DolomiticLimestone, name: "Dolomitic_limestone" },
    { img: Dolostone, name: "Dolostone" },
    { img: DownwardLines, name: "Downward Lines" },
    { img: DykesAndSills, name: "Dykes and Sills" },
    { img: EmptyFile, name: "EmptyFile" },
    { img: FissileMud, name: "Fissile Mud" },
    { img: FissileSilt, name: "Fissile Silt" },
    { img: GridLines, name: "Grid Lines" },
    { img: Gypsum, name: "Gypsum" },
    { img: GypsumAnhydriteUnspecified, name: "Gypsum Anhydrite Unspecified" },
    { img: Halite, name: "Halite" },
    { img: HorizontalDashed, name: "Horizontal Dashed" },
    { img: HorizontalLines, name: "Horizontal Lines" },
    { img: Intrusive, name: "Intrusive" },
    { img: Limestone, name: "Limestone" },
    { img: MaficPlutonic, name: "Mafic Plutonic" },
    { img: Marl, name: "Marl" },
    { img: Metamorphic, name: "Metamorphic" },
    { img: Mud, name: "Mud" },
    { img: Raster, name: "Raster" },
    { img: SaltGeneral, name: "Salt General" },
    { img: Sand, name: "Sand" },
    { img: SedimentBreccia, name: "Sediment Breccia" },
    { img: Shale, name: "Shale" },
    { img: SilicicPlutonic, name: "Silicic Plutonic" },
    { img: Silt, name: "Silt" },
    { img: Tuffitt, name: "Tuffitt" },
    { img: UpwardLines, name: "Upward lines" },
    { img: VerticalBitumenious, name: "Vertical Bitumenious" },
    { img: VerticalCalcareousDolostone, name: "Vertical Calcareous Dolostone" },
    { img: VerticalChalk, name: "Vertical Chalk" },
    { img: VerticalClaystone, name: "Vertical Claystone" },
    { img: VerticalDashed, name: "Vertical Dashed" },
    { img: VerticalDolomiticLimestone, name: "Vertical Dolomitic Limestone" },
    { img: VerticalDolostone, name: "Vertical Dolostone" },
    { img: VerticalFissileMudstone, name: "Vertical Fissile Mudstone" },
    { img: VerticalFissileSiltstone, name: "Vertical Fissile Siltstone" },
    { img: VerticalLimestone, name: "Vertical Limestone" },
    { img: VerticalLines, name: "Vertical Lines" },
    { img: VerticalMarl, name: "Vertical Marl" },
    { img: VerticalShale, name: "Vertical Shale" },
    { img: VerticalTuffitt, name: "Vertical Tuffitt" },
    { img: Vulcanic, name: "Vulcanic" },
]);

export const patternImages = imagesAndNames.map(({ img }) => img);
export const patternNamesEnglish = imagesAndNames.map(({ name }) => name);
