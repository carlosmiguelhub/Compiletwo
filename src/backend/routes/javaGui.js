const express = require("express");
const {
  runJavaGui,
  getContainerLogs,
  getContainerState,
  stopJavaGuiSession,
} = require("../services/javaGuiRunner");

const router = express.Router();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.post("/run", async (req, res) => {
  try {
    const code = req.body?.code;

    if (!code || !String(code).trim()) {
      return res.status(400).json({
        success: false,
        error: "Request body must include a code field.",
      });
    }

    const result = await runJavaGui(code);

    /**
     * Give the container a few seconds to start Xvfb, VNC, noVNC,
     * compile Main.java, and run the Java GUI.
     */
    await delay(4000);

    const state = await getContainerState(result.containerName);

    console.log("[java-gui] state after startup:", state);

    if (state !== "running") {
      const logs = await getContainerLogs(result.containerName);

      console.error("[java-gui] container exited during startup:");
      console.error(logs);

      return res.status(400).json({
        success: false,
        stage: "startup",
        state,
        containerName: result.containerName,
        logs,
        error: logs || "Java GUI container exited before preview became available.",
      });
    }

    return res.json({
      success: true,
      sessionId: result.sessionId,
      containerName: result.containerName,
      previewUrl: result.previewUrl,
      port: result.port,
    });
  } catch (error) {
    console.error("[java-gui] run route failed:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to run Java GUI.",
    });
  }
});

router.get("/status/:containerName", async (req, res) => {
  try {
    const { containerName } = req.params;
    const state = await getContainerState(containerName);

    return res.json({
      success: true,
      state,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get Java GUI status.",
    });
  }
});

router.get("/logs/:containerName", async (req, res) => {
  try {
    const { containerName } = req.params;
    const logs = await getContainerLogs(containerName);

    return res.json({
      success: true,
      logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get Java GUI logs.",
    });
  }
});

router.delete("/stop/:containerName", async (req, res) => {
  try {
    const { containerName } = req.params;

    console.log("[java-gui] stopping container:", containerName);

    await stopJavaGuiSession(containerName);

    return res.json({
      success: true,
      message: "Java GUI session stopped.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to stop Java GUI session.",
    });
  }
});

module.exports = router;