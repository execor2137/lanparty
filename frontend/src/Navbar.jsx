import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import homeIcon from "./assets/home.svg";
import rulesIcon from "./assets/rules.svg";
import discordIcon from "./assets/discord.svg";
import personIcon from "./assets/person.svg";
import teamIcon from "./assets/team.svg";
import adminIcon from "./assets/adminpanel.svg";
import signupIcon from "./assets/signup.svg";

function Navbar({ token, user }) {
  return (
    <ul>
      <li>
        <img src={homeIcon} alt="" />
        <Link to="/">Strona główna</Link>
      </li>
      <li>
        <img src={rulesIcon} alt="" />
        <Link to="/rules">Regulamin</Link>
      </li>
      <li>
        <img src={discordIcon} alt="" />
        <a href="https://discord.gg/M88hB2np" target="_blank" rel="noopener noreferrer">
          Discord
        </a>
      </li>

      {!token ? (
        <>
          <li>
            <img src={signupIcon} alt="" />
            <Link to="/register">Rejestracja</Link>
          </li>
        </>
      ) : (
        <>
          <li>
            <img src={personIcon} alt="" />
            <Link to="/player-dashboard">Kokpit Gracza</Link>
          </li>
          <li>
            <img src={teamIcon} alt="" />
            <Link to="/team-dashboard">Kokpit Drużyny</Link>
          </li>
          {user?.isAdmin === 1 && (
            <li>
              <img src={adminIcon} alt="" />
              <Link to="/admin-panel">Admin Panel</Link>
            </li>
          )}
        </>
      )}
    </ul>
  );
}

// **PropTypes - eliminacja błędów ESLint**
Navbar.propTypes = {
  token: PropTypes.string,
  user: PropTypes.shape({
    isAdmin: PropTypes.number,
  }),
};

export default Navbar;
