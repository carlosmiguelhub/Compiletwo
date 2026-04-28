const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");
const net = require("net");

const TMP_ROOT = path.join(process.cwd(), "tmp", "java-gui-sessions");

/**
 * Ensures a directory exists.
 */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Normalizes line endings.
 */
function sanitizeJavaCode(code) {
  return String(code || "").replace(/\r\n/g, "\n");
}

/**
 * Runs a command and collects stdout/stderr.
 */
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: false });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (exitCode) => {
      if (exitCode !== 0) {
        reject(
          new Error(
            stderr.trim() ||
              stdout.trim() ||
              `${command} failed with exit code ${exitCode}.`
          )
        );
        return;
      }

      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
}

/**
 * Finds a free localhost port for noVNC.
 */
function getFreePort(start = 6101, end = 6199) {
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      if (port > end) {
        reject(new Error(`No free port found between ${start} and ${end}.`));
        return;
      }

      const server = net.createServer();

      server.once("error", () => {
        tryPort(port + 1);
      });

      server.once("listening", () => {
        server.close(() => {
          resolve(port);
        });
      });

      server.listen(port, "0.0.0.0");
    };

    tryPort(start);
  });
}

/**
 * Removes old Java GUI containers so the preview does not show old GUI runs.
 */
async function cleanupOldJavaGuiContainers() {
  try {
    const { stdout } = await runCommand("docker", [
      "ps",
      "-a",
      "--filter",
      "ancestor=cybercompile-java-gui",
      "-q",
    ]);

    const ids = stdout
      .split("\n")
      .map((id) => id.trim())
      .filter(Boolean);

    for (const id of ids) {
      await runCommand("docker", ["rm", "-f", id]);
    }
  } catch (error) {
    console.error("[java-gui] cleanup failed:", error.message);
  }
}

/**
 * Runs Java GUI code inside the Java GUI Docker image.
 */
async function runJavaGui(code) {
  if (!code || !String(code).trim()) {
    throw new Error("Java GUI code is required.");
  }

  ensureDir(TMP_ROOT);

  const sessionId = crypto.randomBytes(8).toString("hex");
  const sessionDir = path.join(TMP_ROOT, sessionId);
  ensureDir(sessionDir);

  /**
   * Version 1 rule:
   * code must use public class Main
   * because we always save Main.java
   */
  const javaFilePath = path.join(sessionDir, "Main.java");
  fs.writeFileSync(javaFilePath, sanitizeJavaCode(code), "utf8");

  const containerName = `cybercompile-java-gui-${sessionId}`;
  const sessionPathForDocker = sessionDir.replace(/\\/g, "/");

  /**
   * Clean old GUI containers first.
   * This prevents previous GUI windows from appearing again.
   */
await cleanupOldJavaGuiContainers();
  const port = await getFreePort(6101, 6199);

  const dockerArgs = [
    "run",
    "-d",
    "--name",
    containerName,
    "-p",
    `${port}:6080`,
    "-v",
    `${sessionPathForDocker}:/app/usercode`,
    "cybercompile-java-gui",
  ];

  console.log("[java-gui] starting container:", containerName);
  console.log("[java-gui] port:", port);
  console.log("[java-gui] session path:", sessionPathForDocker);
  console.log("[java-gui] docker args:", dockerArgs.join(" "));

  const { stdout } = await runCommand("docker", dockerArgs);

  return {
    success: true,
    sessionId,
    containerId: stdout,
    containerName,
    port,
    previewUrl: `http://localhost:${port}/vnc.html?autoconnect=true&resize=scale`,
    sessionDir,
  };
}

async function getContainerLogs(containerName) {
  try {
    const { stdout, stderr } = await runCommand("docker", [
      "logs",
      containerName,
    ]);

    return `${stdout}\n${stderr}`.trim();
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to read container logs.";
  }
}

async function getContainerState(containerName) {
  try {
    const { stdout } = await runCommand("docker", [
      "inspect",
      "-f",
      "{{.State.Status}}",
      containerName,
    ]);

    return stdout.trim() || "unknown";
  } catch {
    return "not_found";
  }
}

async function stopJavaGuiSession(containerName) {
  try {
    await runCommand("docker", ["rm", "-f", containerName]);
  } catch {
    // ignore cleanup errors
  }
}

module.exports = {
  runJavaGui,
  getContainerLogs,
  getContainerState,
  stopJavaGuiSession,
};