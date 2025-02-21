require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || "tajny_klucz";

app.use(cors());
app.use(express.json());

// Połączenie z bazą
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('❌ Błąd połączenia z bazą:', err);
    } else {
        console.log('✅ Połączono z bazą MySQL!');
    }
});

// 🔹 Middleware do autoryzacji JWT
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: "Brak tokena, dostęp zabroniony!" });
    }

    jwt.verify(token.replace('Bearer ', ''), SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Nieprawidłowy token!" });
        }
        req.user = user;
        next();
    });
};

// 🔹 Middleware dla adminów
const authenticateAdmin = (req, res, next) => {
    db.query('SELECT isAdmin FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (err || results.length === 0 || !results[0].isAdmin) {
            return res.status(403).json({ error: "Brak uprawnień!" });
        }
        next();
    });
};

// 🔹 Rejestracja użytkownika
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Wszystkie pola są wymagane!" });
    }

    try {
        db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, results) => {
            if (results.length > 0) {
                return res.status(400).json({ error: "Email lub nazwa użytkownika jest już zajęta!" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json({ message: "Rejestracja udana!" });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: "Wewnętrzny błąd serwera" });
    }
});

// 🔹 Logowanie użytkownika (generowanie JWT)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Wszystkie pola są wymagane!" });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Błąd serwera" });
        if (results.length === 0) {
            return res.status(401).json({ error: "Nieprawidłowy email lub hasło!" });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Nieprawidłowy email lub hasło!" });
        }

        // Generowanie tokena JWT
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET_KEY, {
            expiresIn: "30d"
        });

        res.json({ message: "Logowanie udane!", token });
    });
});

// 🔹 Pobieranie profilu zalogowanego użytkownika
app.get('/api/profile', authenticateToken, (req, res) => {
    db.query('SELECT id, username, email, nick, game_version, team_id, isAdmin, created_at FROM users WHERE id = ?', 
        [req.user.id], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ error: "Użytkownik nie znaleziony" });

            res.json(results[0]);
        }
    );
});

// 🔹 Edycja profilu użytkownika (zmiana nicku i wersji gry)
app.put('/api/profile', authenticateToken, (req, res) => {
    const { nick, game_version } = req.body;

    if (!nick || !game_version) {
        return res.status(400).json({ error: "Wszystkie pola są wymagane!" });
    }

    db.query('UPDATE users SET nick = ?, game_version = ? WHERE id = ?', 
        [nick, game_version, req.user.id], 
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ message: "Profil zaktualizowany!" });
        }
    );
});

// 🔹 Pobieranie regulaminu
app.get('/api/rules', (req, res) => {
    db.query('SELECT content FROM rules WHERE id = 1', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Regulamin nie znaleziony" });

        res.json({ content: results[0].content });
    });
});

// 🔹 Edycja regulaminu (tylko dla adminów)
app.put('/api/rules', authenticateToken, authenticateAdmin, (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Treść regulaminu jest wymagana!" });
    }

    db.query('UPDATE rules SET content = ? WHERE id = 1', [content], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: "Regulamin zaktualizowany!" });
    });
});

// 🔹 Start serwera
app.listen(PORT, () => console.log(`🚀 Serwer działa na http://localhost:${PORT}`));
