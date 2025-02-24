import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles.css';
import Navbar from './Navbar';
import Home from './Home';
import Rules from './Rules';
import Login from './Login';
import Register from './Register';
import PlayerDashboard from './PlayerDashboard';
import TeamDashboard from './TeamDashboard'; // Importujemy nowy komponent
import Sponsors from './Sponsors'; // Importujemy nowy komponent
import lanLogo from './assets/lan.svg';
import loginIcon from './assets/login.svg';
import logoutIcon from './assets/logout.svg';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [user, setUser] = useState(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        if (token) {
            fetch('http://localhost:5000/api/profile', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setUser(data);
                    } else {
                        handleLogout();
                    }
                });
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
        window.location.href = '/';
    };

    const handleLoginSuccess = (newToken) => {
        setToken(newToken);
        setIsLoginModalOpen(false); // Zamknięcie okna logowania po zalogowaniu
        window.location.href = '/';
    };

    return (
        <Router>
            <div className="top-bar">
                <div className="logo">
                    <img src={lanLogo} alt="LAN Party" />
                    LAN Party Góra 2025
                </div>
                <div className="user-panel">
                    {token ? (
                        <>
                            <p>{user?.username || "Nieznany użytkownik"}</p>
                            <span onClick={handleLogout}>
                                <img src={logoutIcon} alt="Wyloguj" /> Wyloguj
                            </span>
                        </>
                    ) : (
                        <span onClick={() => setIsLoginModalOpen(true)}>
                            <img src={loginIcon} alt="Zaloguj" /> Zaloguj
                        </span>
                    )}
                </div>
            </div>

            <div className="container">
                <div className="sidebar">
                    <Navbar token={token} user={user} handleLogout={handleLogout} />
                </div>

                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/rules" element={<Rules />} />
                        <Route path="/register" element={token ? <p>Jesteś już zalogowany</p> : <Register />} />
                        <Route path="/player-dashboard" element={token ? <PlayerDashboard token={token} /> : <Home />} />
                        <Route path="/team-dashboard" element={token ? <TeamDashboard token={token} /> : <Home />} />
                    </Routes>
                </div>

                <Sponsors /> {/* Dodajemy komponent Sponsors */}
            </div>

            {/* Modal logowania */}
            {isLoginModalOpen && (
                <div className="modal-overlay">
                    <div className="modal active">
                        <h2>Logowanie</h2>
                        <Login setToken={handleLoginSuccess} closeModal={() => setIsLoginModalOpen(false)} />
                        <div className="modal-buttons">
                            <button className="login-btn" onClick={() => document.querySelector('.modal form').submit()}>Zaloguj</button>
                            <button className="cancel-btn" onClick={() => setIsLoginModalOpen(false)}>Anuluj</button>
                        </div>
                    </div>
                </div>
            )}
        </Router>
    );
}

export default App;