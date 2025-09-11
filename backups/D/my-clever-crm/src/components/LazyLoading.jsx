import React, { Suspense } from 'react';

// Usage: <LazyLoading component={React.lazy(() => import('./SomeComponent'))} fallback={<div>Loading...</div>} />
const LazyLoading = ({ component: Component, fallback = null, ...props }) => (
  <Suspense fallback={fallback}>
    <Component {...props} />
  </Suspense>
);

export default LazyLoading;
