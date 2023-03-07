import { Route, Routes, Link } from 'react-router-dom';
import { AllFeaturesScreen, SingleFeature } from './screens';
import React from 'react';

export function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <div>
                        This is the generated root route.{' '}
                        <Link to="/page-2">Click here for page 2.</Link>
                    </div>
                }
            />
            <Route path="/projects/:projectId/features" element={<AllFeaturesScreen />} />
            <Route path="/projects/:projectId/features/:featureKey" element={<SingleFeature />} />
        </Routes>
    );
}

export default App;
