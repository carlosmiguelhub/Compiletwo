const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();
const pool = require("./mysql");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is running." });
});

app.get("/api/mysql-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ success: true, rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || "MySQL connection failed.",
    });
  }
});

function makeSafeDatabaseName(userId) {
  const safeUserId = String(userId).replace(/[^a-zA-Z0-9_]/g, "_");
  return `sandbox_${safeUserId}`;
}

app.post("/api/sql/execute", async (req, res) => {
  let connection;

  try {
    const { query, userId } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: "SQL query is required.",
      });
    }

    if (!userId || !String(userId).trim()) {
      return res.status(400).json({
        success: false,
        error: "User ID is required.",
      });
    }

    const sandboxDbName = makeSafeDatabaseName(userId);

    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      multipleStatements: true,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${sandboxDbName}\``
    );

    await connection.query(`USE \`${sandboxDbName}\``);

    const [result] = await connection.query(query);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("SQL execute error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "SQL execution failed.",
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});