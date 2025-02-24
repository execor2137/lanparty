import sponsors from './assets/sponsors/sponsors';
import './styles.css'; // Importujemy plik CSS

const Sponsors = () => {
  return (
    <div className="sponsors-container">
      <div className="sponsors-marquee">
        {sponsors.concat(sponsors).map((image, index) => ( // Zapętlamy obrazki
          <img key={index} src={image.default} alt={`Sponsor ${index + 1}`} className="sponsor-image" />
        ))}
      </div>
    </div>
  );
};

export default Sponsors;