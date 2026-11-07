const express = require('express'), session = require('express-session'), passport = require('passport'), Strategy = require('passport-discord').Strategy;
const app = express();

const CLIENT_ID = 'TU_CLIENT_ID';
const CLIENT_SECRET = 'TU_SECRET';
const CALLBACK_URL = 'https://tu-proyecto.onrender.com/auth/discord/callback';

passport.serializeUser((u, d) => d(null, u)); 
passport.deserializeUser((o, d) => d(null, o));
passport.use(new Strategy({ clientID: CLIENT_ID, clientSecret: CLIENT_SECRET, callbackURL: CALLBACK_URL, scope: ['identify'] }, (a, r, p, d) => {
    p.coins = 250; p.whitelist = 'En revisión'; return d(null, p);
}));

app.use(session({ secret: 'prime_secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize(), passport.session(), express.urlencoded({ extended: true }));

const auth = (req, res, next) => req.isAuthenticated() ? next() : res.redirect('/');

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => res.redirect('/panel'));
app.get('/logout', (req, res) => req.logout(() => res.redirect('/')));

app.get('/', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/panel');
    res.send(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>Login</title><style>body{background:#0b0b0c;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}.card{background:#141416;padding:30px;border-radius:12px;text-align:center;border:1px solid #2a2a2d;width:85%;max-width:350px}.btn{background:#5865F2;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:15px}</style></head><body><div class="card"><h2>PRIME RP</h2><p>Inicia sesión con Discord</p><a class="btn" href="/auth/discord">Conectar</a></div></body></html>`);
});

app.get('/panel', auth, (req, res) => {
    res.send(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>Panel</title><style>body{background:#0b0b0c;color:#fff;font-family:sans-serif;margin:0;padding:20px}.card{background:#141416;border:1px solid #2a2a2d;padding:20px;border-radius:12px;margin-bottom:15px}.coins{color:#2ecc71;font-weight:bold}</style></head><body><h2>Hola, ${req.user.username}</h2><div class="card"><p>Whitelist: <b>${req.user.whitelist}</b></p><p>Coins: <span class="coins">🪙 ${req.user.coins}</span></p></div><a href="/logout" style="color:#ff5555;text-decoration:none">Cerrar sesión</a></body></html>`);
});

app.listen(process.env.PORT || 3000);
