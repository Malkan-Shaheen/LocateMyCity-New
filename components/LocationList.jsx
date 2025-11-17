'use client';
import { memo, useMemo } from 'react';

const LocationItem = memo(({ location, onLocationClick }) => (
  <div className="country-item">
    <span className="country-name">{location.name}</span>
    <button 
      className="view-map-btn" 
      onClick={() => onLocationClick(location.lat, location.lon, location.name)}
      style={{ width: '120px' }}
      aria-label={`View ${location.name} on map`}
    >
      View on Map
    </button>
  </div>
));

LocationItem.displayName = 'LocationItem';

const LocationList = memo(({ locations, onLocationClick, totalCount }) => {
  // Group locations by state for better organization
  const locationsByState = useMemo(() => {
    return locations.reduce((acc, loc) => {
      if (!acc[loc.state]) acc[loc.state] = [];
      acc[loc.state].push(loc);
      return acc;
    }, {});
  }, [locations]);

  return (
    <div className="location-list-container">
     
      <div style={{ marginBottom: '1rem', textAlign: 'center', fontWeight: 500, color: '#333' }}>
                  {`Showing ${locations.length} of ${totalCount} locations`}
                </div>
      {Object.keys(locationsByState).sort().map(state => (
        <div key={state} className="state-group">
          <h3 className="state-group-title">{state}</h3>
          <div className="countries-list">
            {locationsByState[state].map(loc => (
              <LocationItem
                key={`${loc.name}-${loc.lat}-${loc.lon}-paginated`}
                location={loc}
                onLocationClick={onLocationClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

LocationList.displayName = 'LocationList';

export default LocationList;
