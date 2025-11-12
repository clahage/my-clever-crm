// scr-admin-vite/src/components/ClientMap.jsx
import React from 'react';
import Card from './ui/card';

function ClientMap() {
  return (
    <Card className="h-96 flex flex-col items-center justify-center">
      <h3 className="text-lg font-semibold mb-4">Client Location Map</h3>
      <div className="flex-1 w-full bg-speedy-dark-neutral-200 dark:bg-speedy-dark-neutral-700 rounded-md flex items-center justify-center text-speedy-dark-neutral-500 dark:text-speedy-dark-neutral-400 text-center p-4"> {/* Adjusted colors */}
        <p>Interactive Map of Client Locations will go here.</p>
      </div>
      <p className="text-sm text-speedy-dark-neutral-500 dark:text-speedy-dark-neutral-400 mt-4"> {/* Adjusted colors */}
        Visualize client distribution.
      </p>
    </Card>
  );
}

export default ClientMap;