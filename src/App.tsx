import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import 'leaflet/dist/leaflet.css'
import './App.css'

interface User {
  name: {
    first: string;
    last: string;
  };
  email: string;
  phone: string;
  location: {
    city: string;
    country: string;
    street: {
      name: string;
      number: number;
    };
    coordinates: {
      latitude: string;
      longitude: string;
    };
  };
  picture: {
    large: string;
  };
  dob: {
    age: number;
    date: string;
  };
  gender: string;
  login: {
    username: string;
  };
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [galleryUsers, setGalleryUsers] = useState<User[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  // Filters removed - now using random users

  const [favorites, setFavorites] = useState<User[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  const getBackgroundColor = (gender: string, age: number) => {
    if (age > 50) return 'linear-gradient(135deg, #434343 0%, #000000 100%)'; // Grey elegant
    if (age < 25) return 'linear-gradient(135deg, #00d2d3 0%, #54a0ff 100%)'; // Cyan fresh
    if (gender === 'male') return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Blue dark
    if (gender === 'female') return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'; // Pink pastel
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const fetchUser = () => {
    setLoading(true);
    setError(null);
    setIsFlipping(true);

    // Check cache first
    const cacheKey = `user_random`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes

    if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
      // Use cached data
      setUser(JSON.parse(cachedData));
      setLoading(false);
      setTimeout(() => setIsFlipping(false), 500);
      // Fetch new data in background
      fetchNewData();
    } else {
      // Fetch new data
      fetchNewData();
    }

    function fetchNewData() {
      const url = `https://randomuser.me/api/`;
      fetch(url)
        .then(response => response.json())
        .then(data => {
          const userData = data.results[0];
          setUser(userData);
          // Cache the data
          localStorage.setItem(cacheKey, JSON.stringify(userData));
          localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
          setLoading(false);
          setTimeout(() => setIsFlipping(false), 500); // Reset flip after animation
        })
        .catch(err => {
          setError('Failed to fetch user data');
          setLoading(false);
          setIsFlipping(false);
        });
    }
  };

  const fetchGalleryUsers = () => {
    setGalleryLoading(true);
    const url = `https://randomuser.me/api/?results=5`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setGalleryUsers(data.results);
        setGalleryLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch gallery users:', err);
        setGalleryLoading(false);
      });
  };

  const filteredGalleryUsers = galleryUsers;

  const isFavorite = (user: User) => {
    return favorites.some(fav => fav.login.username === user.login.username);
  };

  const toggleFavorite = (user: User) => {
    let newFavorites;
    if (isFavorite(user)) {
      newFavorites = favorites.filter(fav => fav.login.username !== user.login.username);
    } else {
      newFavorites = [...favorites, user];
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const viewProfileDetails = (user: User) => {
    setSelectedProfile(user);
    setShowProfileDetails(true);
  };

  const closeProfileDetails = () => {
    setSelectedProfile(null);
    setShowProfileDetails(false);
  };

  useEffect(() => {
    fetchUser();
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  if (loading) {
    return (
      <div className="app" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <motion.div
          className="hero-section skeleton"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <div className="hero-content">
            <motion.div
              className="skeleton-picture"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            ></motion.div>
            <div className="hero-info">
              <motion.div
                className="skeleton-name"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              ></motion.div>
              <motion.div
                className="skeleton-text"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              ></motion.div>
              <motion.div
                className="skeleton-text"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              ></motion.div>
            </div>
          </div>
          <div className="button-group">
            <motion.div
              className="skeleton-button"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            ></motion.div>
            <motion.div
              className="skeleton-button"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
            ></motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!user) {
    return <div className="error">No user data available</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={user.login.username}
        className="app"
        style={{ background: user ? getBackgroundColor(user.gender, user.dob.age) : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={`hero-section ${isFlipping ? 'flip' : ''}`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="hero-content">
            <motion.img
              src={user.picture.large}
              alt={`${user.name.first} ${user.name.last}`}
              className="hero-picture"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            />
            <motion.div
              className="hero-info"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h1 className="hero-name">{user.name.first} {user.name.last}</h1>
              <p className="hero-country">🌍 {user.location.country}</p>
              <p className="hero-email">📧 {user.email}</p>
              <p className="hero-age">🎂 {user.dob.age} years old</p>
              <p className="hero-gender">👤 {user.gender}</p>
            </motion.div>
          </div>
          <motion.div
            className="button-group"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >

            <button onClick={fetchUser} className="refresh-button" disabled={loading}>
              🔁 Generate New Profile
            </button>

            <button onClick={() => user && viewProfileDetails(user)} className="view-details-button">
              View Details
            </button>
            <button onClick={() => user && toggleFavorite(user)} className="favorite-button">
              {user && isFavorite(user) ? '⭐ Remove Favorite' : '☆ Add to Favorite'}
            </button>
            <button onClick={() => setShowFavorites(!showFavorites)} className="favorites-view-button">
              {showFavorites ? 'Hide Favorites' : 'View Favorites'} ({favorites.length})
            </button>
          </motion.div>
        </motion.div>
      {showDetails && (
        <div className="details-section">
          <div className="details-content">
            <div className="detail-item">
              <span className="detail-label">📅 Birth Date:</span>
              <span className="detail-value">{new Date(user.dob.date).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">🏠 Full Address:</span>
              <span className="detail-value">{user.location.street.number} {user.location.street.name}, {user.location.city}, {user.location.country}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">👤 Username:</span>
              <span className="detail-value">{user.login.username}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">📞 Phone:</span>
              <span className="detail-value">{user.phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">📍 Coordinates:</span>
              <span className="detail-value">Lat: {user.location.coordinates.latitude}, Lng: {user.location.coordinates.longitude}</span>
            </div>
          </div>
          <div className="map-container">
            <MapContainer
              center={[parseFloat(user.location.coordinates.latitude), parseFloat(user.location.coordinates.longitude)]}
              zoom={13}
              style={{ height: '300px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[parseFloat(user.location.coordinates.latitude), parseFloat(user.location.coordinates.longitude)]}>
                <Popup>
                  {user.name.first} {user.name.last}<br />
                  {user.location.city}, {user.location.country}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
      {showFavorites && favorites.length > 0 && (
        <div className="favorites-section">
          <h2 className="favorites-title">Favorite Profiles</h2>
          <div className="favorites-grid">
            {favorites.map((favUser, index) => (
              <div key={index} className="favorite-card">
                <img src={favUser.picture.large} alt={`${favUser.name.first} ${favUser.name.last}`} className="favorite-picture" />
                <div className="favorite-info">
                  <h3 className="favorite-name">{favUser.name.first} {favUser.name.last}</h3>
                  <p className="favorite-country">🌍 {favUser.location.country}</p>
                  <p className="favorite-email">📧 {favUser.email}</p>
                  <p className="favorite-age">🎂 {favUser.dob.age} years old</p>
                  <button onClick={() => viewProfileDetails(favUser)} className="view-details-button">
                    View Details
                  </button>
                  <button onClick={() => toggleFavorite(favUser)} className="remove-favorite-button">
                    Remove from Favorites
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {galleryUsers.length > 0 && (
        <div className="gallery-section">
          <h2 className="gallery-title">Profile Gallery</h2>

          <motion.div
            className="gallery-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {filteredGalleryUsers.map((galleryUser, index) => (
              <motion.div
                key={index}
                className="gallery-card"
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="card-front">
                  <img src={galleryUser.picture.large} alt={`${galleryUser.name.first} ${galleryUser.name.last}`} className="gallery-picture" />
                  <h3 className="gallery-name">{galleryUser.name.first} {galleryUser.name.last}</h3>
                  <p className="gallery-country">{galleryUser.location.country}</p>
                  <button onClick={() => viewProfileDetails(galleryUser)} className="view-details-button">
                    View Details
                  </button>
                </div>
                <div className="card-back">
                  <div className="back-details">
                    <p><strong>Email:</strong> {galleryUser.email}</p>
                    <p><strong>Phone:</strong> {galleryUser.phone}</p>
                    <p><strong>Age:</strong> {galleryUser.dob.age}</p>
                    <p><strong>Gender:</strong> {galleryUser.gender}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
      {showProfileDetails && selectedProfile && (
        <motion.div
          className="profile-details-modal"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <div className="modal-content">
            <button onClick={closeProfileDetails} className="close-modal-button">✕</button>
            <div className="modal-header">
              <img src={selectedProfile.picture.large} alt={`${selectedProfile.name.first} ${selectedProfile.name.last}`} className="modal-picture" />
              <div className="modal-info">
                <h2 className="modal-name">{selectedProfile.name.first} {selectedProfile.name.last}</h2>
                <p className="modal-country">🌍 {selectedProfile.location.country}</p>
                <p className="modal-email">📧 {selectedProfile.email}</p>
                <p className="modal-age">🎂 {selectedProfile.dob.age} years old</p>
                <p className="modal-gender">👤 {selectedProfile.gender}</p>
              </div>
            </div>
            <div className="modal-details">
              <div className="detail-item">
                <span className="detail-label">📅 Birth Date:</span>
                <span className="detail-value">{new Date(selectedProfile.dob.date).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🏠 Full Address:</span>
                <span className="detail-value">{selectedProfile.location.street.number} {selectedProfile.location.street.name}, {selectedProfile.location.city}, {selectedProfile.location.country}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">👤 Username:</span>
                <span className="detail-value">{selectedProfile.login.username}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📞 Phone:</span>
                <span className="detail-value">{selectedProfile.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📍 Coordinates:</span>
                <span className="detail-value">Lat: {selectedProfile.location.coordinates.latitude}, Lng: {selectedProfile.location.coordinates.longitude}</span>
              </div>
            </div>
            <div className="modal-map">
              <MapContainer
                center={[parseFloat(selectedProfile.location.coordinates.latitude), parseFloat(selectedProfile.location.coordinates.longitude)]}
                zoom={13}
                style={{ height: '300px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[parseFloat(selectedProfile.location.coordinates.latitude), parseFloat(selectedProfile.location.coordinates.longitude)]}>
                  <Popup>
                    {selectedProfile.name.first} {selectedProfile.name.last}<br />
                    {selectedProfile.location.city}, {selectedProfile.location.country}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </motion.div>
      )}
      </motion.div>
    </AnimatePresence>
  );
}

export default App
