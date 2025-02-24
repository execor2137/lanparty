import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import './styles.css'; // Importujemy plik CSS

const TeamDashboard = ({ token }) => {
  const [team, setTeam] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamTag, setTeamTag] = useState("");
  const [message, setMessage] = useState("");
  const [pendingRequest, setPendingRequest] = useState(false);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    // Fetch team data if the user is part of a team
    fetch("http://localhost:5000/api/team", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setTeam(data);
        }
      });

    // Fetch list of teams
    fetch("http://localhost:5000/api/teams", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setTeams(data);
        }
      });
  }, [token]);

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    console.log("Rejestracja drużyny:", { teamName, teamTag });

    const response = await fetch("http://localhost:5000/api/team/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ teamName, teamTag }),
    });

    const data = await response.json();
    console.log("Odpowiedź serwera:", data);
    setMessage(data.message || data.error);

    if (!data.error) {
      setPendingRequest(true);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    console.log("Dołączanie do drużyny:", { teamName });

    const response = await fetch("http://localhost:5000/api/team/join", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ teamName }),
    });

    const data = await response.json();
    console.log("Odpowiedź serwera:", data);
    setMessage(data.message || data.error);

    if (!data.error) {
      setPendingRequest(true);
    }
  };

  if (!token) {
    return <p>Musisz być zalogowany!</p>;
  }

  return team ? (
    <div>
      <h1>Witaj w drużynie, {team.name}!</h1>
      {/* Dodaj tutaj zarządzanie drużyną */}
    </div>
  ) : (
    <div>
      <h1>Kokpit drużyny</h1><br></br>
      {pendingRequest ? (
        <p>Oczekujesz na akceptację drużyny!</p>
      ) : (
        <div className="team-dashboard">
          <div className="tab-content">
            <div className="register-team">
              <h2>Zarejestruj nową drużynę</h2><br></br>
              <form onSubmit={handleRegisterTeam}>
                <input
                  type="text"
                  placeholder="Nazwa drużyny"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Tag drużyny"
                  value={teamTag}
                  onChange={(e) => setTeamTag(e.target.value)}
                  maxLength="8"
                  required
                />
                <button type="submit">Zarejestruj drużynę</button>
              </form>
            </div>
            <div className="join-team">
              <h2>Dołącz do istniejącej drużyny</h2><br></br>
              {teams.length > 0 ? (
                <form onSubmit={handleJoinTeam}>
                  <select
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  >
                    <option value="">Wybierz drużynę</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <button type="submit">Zgłoś się</button>
                </form>
              ) : (
                <p>Na ten moment nie ma żadnych zarejestrowanych drużyn. Zarejestruj nową drużynę i bądź pierwszy!</p>
              )}
            </div>
          </div>
        </div>
      )}
      {message && <h2 className="message">{message}</h2>}
    </div>
  );
};

TeamDashboard.propTypes = {
  token: PropTypes.string.isRequired,
};

export default TeamDashboard;