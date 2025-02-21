import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

function PlayerDashboard({ token }) {
  const [user, setUser] = useState(null);
  const [nick, setNick] = useState("");
  const [gameVersion, setGameVersion] = useState("Steam");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const storedMessage = localStorage.getItem("profileMessage");
    if (storedMessage) {
      setMessage(storedMessage);
      localStorage.removeItem("profileMessage");
      setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
    }

    fetch("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setUser(data);
          setNick(data.nick || "");
          setGameVersion(data.game_version || "Steam");
        } else {
          navigate("/");
        }
      });
  }, [token, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nick, game_version: gameVersion }),
    });

    const data = await response.json();
    setMessage(data.message || data.error);

    // Store message in local storage and refresh the page
    if (!data.error) {
      localStorage.setItem("profileMessage", "Profil został zaktualizowany");
      window.location.reload();
    }
  };

  if (!token) {
    return <p>Musisz być zalogowany!</p>;
  }

  return user ? (
    <div>
      <h1>Witaj, {user.username}!</h1>
      <br></br><br></br>
      <h2>Twoje ustawienia:</h2>
      <p>Nick: {user.nick || "Brak"}</p>
      <p>Wersja gry: {user.game_version}</p>
      <br></br><br></br>
      <h2>Zmień ustawienia:</h2>
      <form onSubmit={handleUpdateProfile}>
        <input
          type="text"
          placeholder="Nick"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          required
        />
        <br></br>
        <select value={gameVersion} onChange={(e) => setGameVersion(e.target.value)}>
          <option value="Steam">Steam</option>
          <option value="Non-Steam">Non-Steam</option>
          <option value="Steam+NS">Steam + Non-Steam</option>
        </select>
        <br></br>
        <button type="submit">Zapisz</button>
      </form>
      <br></br>
      {message && <h2 className="message">{message}</h2>}
    </div>
  ) : (
    <p>Ładowanie...</p>
  );
}

// **PropTypes - eliminacja błędów ESLint**
PlayerDashboard.propTypes = {
  token: PropTypes.string,
};

export default PlayerDashboard;