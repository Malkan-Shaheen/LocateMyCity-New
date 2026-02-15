import {
  FaMapMarkerAlt,
  FaGlobeAmericas as FaGlobe,
  FaMapMarkedAlt,
  FaClock,
  FaMoneyBillWave,
  FaLanguage
} from 'react-icons/fa';

export default function CountryInfoDetails({ 
  destinationName, 
  destinationCountry, 
  destinationCoords, 
  countryInfo 
}) {
  return (
    <>
      <div className="detail-item">
        <FaMapMarkerAlt className="detail-icon location-icon" />
        <div>
          <h4>Location</h4>
          <p>{destinationName}</p>
        </div>
      </div>
      <div className="detail-item">
        <FaGlobe className="detail-icon globe-icon" />
        <div>
          <h4>Country/Region</h4>
          <p>{destinationCountry}</p>
        </div>
      </div>
      <div className="detail-item">
        <FaMapMarkedAlt className="detail-icon coordinates-icon" />
        <div>
          <h4>GPS Coordinates</h4>
          <p className="coordinates">{destinationCoords}</p>
        </div>
      </div>
      <div className="detail-item">
        <FaClock className="detail-icon timezone-icon" />
        <div>
          <h4>Timezone</h4>
          <p>{countryInfo.timezone}</p>
        </div>
      </div>
      <div className="detail-item">
        <FaMoneyBillWave className="detail-icon currency-icon" />
        <div>
          <h4>Currency</h4>
          <p>{countryInfo.currency}</p>
        </div>
      </div>
      <div className="detail-item">
        <FaLanguage className="detail-icon language-icon" />
        <div>
          <h4>Language</h4>
          <p>{countryInfo.languages}</p>
        </div>
      </div>
    </>
  );
}