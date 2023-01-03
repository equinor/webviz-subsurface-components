import React from "react";
import { View } from "@deck.gl/core/typed";

interface ViewAnnotationProps {
    id: string;
}

const ViewAnnotation: React.FC<ViewAnnotationProps> = ({
    id,
}: ViewAnnotationProps) => {
    // @ts-expect-error This is demonstrated to work with js, but with ts it gives error
    return <View id={id} />;
};

export default ViewAnnotation;
