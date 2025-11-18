import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  const formatName = (str) => {
    return str.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <Link to="/" className="hover:text-gray-900 dark:hover:text-white">
        <HomeIcon className="h-4 w-4" />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return (
          <React.Fragment key={name}>
            <ChevronRightIcon className="h-3 w-3" />
            {isLast ? (
              <span className="text-gray-900 dark:text-white font-medium">
                {formatName(name)}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-gray-900 dark:hover:text-white">
                {formatName(name)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
