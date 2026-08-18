// eslint-disable-next-line @typescript-eslint/no-unused-vars

import type { Meta, StoryObj } from "@storybook/react-webpack5";

import InfoCard from "../../components/InfoCard";
import { type LayerPickInfo } from "../../layers/utils/layerTools";

const stories: Meta = {
    component: InfoCard,
    title: "SubsurfaceViewer/Components/InfoCard",
    tags: ["no-screenshot-test"],
};
export default stories;

export const SingleProperty: StoryObj<typeof InfoCard> = {
    args: {
        pickInfos: [
            {
                x: 152,
                y: 254,
                coordinate: [111, 222],
            } as LayerPickInfo,
        ],
    },
    render: (args) => <InfoCard {...args} />,
};

export const MutipleProperties: StoryObj<typeof InfoCard> = {
    args: {
        pickInfos: [
            {
                x: 152,
                y: 254,
                coordinate: [111, 222],
            } as LayerPickInfo,
            {
                // @ts-expect-error TS2740
                layer: { id: "wells-layer" },
                property: { name: "Poro WellA", value: 123 },
            },
        ],
    },
};
