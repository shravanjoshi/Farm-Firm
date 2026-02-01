const express = require('express');
const path = require('path');

const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
//const errors = require('./controllers/errors');
const mongoose = require('mongoose');
const MONGODB_URL = 'mongodb://127.0.0.1:27017/farmproject';
const authrouter = require('./routes/authrouter');
const PORT= process.env.PORT || 4003;
const farmerrouter=require('./routes/farmerRouter');
const firmrouter=require('./routes/firmRouter');
const croprouter=require('./routes/cropRouter');
const adminrouter = require('./routes/adminrouter');


require('dotenv').config();

const app = express();
const FRONTEND_URL = 'http://localhost:5173';

// 🔐 CORS CONFIG
const allowedOrigins = [
  'http://localhost:5173',
 ];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / curl

      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.options('*', cors());

// 🧩 Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));
// 🔐 JWT middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const token = req.cookies.Usercookie;
  console.log(token);
  if (!token) {
    req.isLoggedIn = false;
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, "sjbkjsbfkjafbjkasbdjka");
    req.isLoggedIn = true;
    req.user = {
      _id: decoded.userId,
      email: decoded.email,
      userType: decoded.userType,
    };
  } catch {
    req.isLoggedIn = false;
    req.user = null;
  }

  next();
});

// 🌍 Public routes
app.use(croprouter);
app.use(authrouter);
app.use(adminrouter)
// 🔒 Protected routes
app.use((req, res, next) => {
  if (req.isLoggedIn) return next();
  return res.status(401).json({ error: 'Unauthorized, please log in' });
});

app.use(farmerrouter);
app.use(firmrouter);

// ❌ 404
//app.use(errors.error404);

// 🚀 Start server
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log('Connected to Mongo');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Mongo connection error:', err);
  });

