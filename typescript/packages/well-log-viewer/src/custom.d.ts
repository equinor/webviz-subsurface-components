declare module "*.svg" {
    import React = require("react");
    export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}
declare module "*.png";
declare module "@emerson-eps/color-tables";
declare module "deck.gl";
declare module "*.scss" {
    const content: string;
    export default content;
}
