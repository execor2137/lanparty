import { useState } from "react";
import PropTypes from "prop-types";

const Login = ({ setToken, closeModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
    } else {
      alert("Błąd logowania! Sprawdź dane.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Zaloguj</button>
          <button type="button" onClick={closeModal}>Anuluj</button>
        </form>
      </div>
    </div>
  );
};

// ✅ Dodajemy PropTypes
Login.propTypes = {
  setToken: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default Login;
