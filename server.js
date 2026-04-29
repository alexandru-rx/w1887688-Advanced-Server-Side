require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/auth");
const connectDB = require("./db");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const requireAuth = require("./middleware/requireAuth");
const profileRoutes = require("./routes/profile");
const bidRoutes = require("./routes/bids");
const participatingAlumnusRoutes = require("./routes/participatingAlumnus");
const apiKeyRoutes = require("./routes/apiKeys");
const clientRoutes = require("./routes/client");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const cors = require("cors");
const analyticsRoutes = require("./routes/analytics");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://alexandru-rx.github.io"
    ],
    credentials: true
  })
);

// Allows server to read and understand data sent from client
app.use(express.json());

// Sessions configurations stored in MongoDB
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallbackSecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
    }),
    cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60
}
    })
);

// Basic health check route
app.get("/health", (req, res) => {
  res.json({ message: "API running" });
});

// Basic root route for deployed backend
app.get("/", (req, res) => {
  res.send("Alumni Influencers API is running");
});

// Example protected route using authentication middleware
app.get("/protected-test", requireAuth, (req, res) => {
  res.json({
    message: "You are authenticated",
    userId: req.session.userId
  });
});

// Registers all route modules
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/bids", bidRoutes);
app.use("/participatingAlumnus", participatingAlumnusRoutes);
app.use("/apiKeys", apiKeyRoutes);
app.use("/client", clientRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

// Starts server only after successful database connection
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
  });
}

start();
