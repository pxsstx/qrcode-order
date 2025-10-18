import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// Routes
import authRoute from "./routes/v1/auth.route";
import usersRoute from "./routes/v1/users.route";
import menusRoute from "./routes/v1/menus.route";
import ordersRoute from "./routes/v1/orders.route";
import tablesRoute from "./routes/v1/tables.route";

// Utils
import { connectDB, disconnectDB } from "./utils/db";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    success: true,
    message: "QR Code Order API is running",
    version: "1.0.0",
  });
});

// API Routes
app.route("/api/v1/auth", authRoute);
app.route("/api/v1/users", usersRoute);
app.route("/api/v1/menus", menusRoute);
app.route("/api/v1/orders", ordersRoute);
app.route("/api/v1/tables", tablesRoute);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: "Route not found",
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error("Error:", err);
  return c.json(
    {
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    },
    500
  );
});

// Start server
const PORT = parseInt(process.env.PORT || "3001");

const startServer = async () => {
  try {
    await connectDB();

    Bun.serve({
      fetch: app.fetch,
      port: PORT,
    });

    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await disconnectDB();
  process.exit(0);
});

startServer();
