import React from 'react';
import { useParams } from "react-router-dom";
import { AllFeaturesTable } from "./all-features-table";

export function AllFeaturesScreen() {
    const { projectId } = useParams();

    return (
        <AllFeaturesTable
            environmentKey={"test-env-1"}
            {...{ projectId }}
        />
    )
}