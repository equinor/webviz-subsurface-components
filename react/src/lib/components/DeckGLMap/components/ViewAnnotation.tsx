import React from "react";
import { View } from "@deck.gl/core/typed";

interface ViewAnnotationProps {
    id: string;
}

const ViewAnnotation: React.FC<ViewAnnotationProps> = ({
    id,
}: ViewAnnotationProps) => {
    return <View id={id} />;
};

export default ViewAnnotation;
