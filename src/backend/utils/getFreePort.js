const net = require("net");

function getFreePort(start = 6101, end = 6199) {
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      if (port > end) {
        reject(new Error("No free ports available for Java GUI sessions."));
        return;
      }

      const server = net.createServer();

      server.once("error", () => {
        tryPort(port + 1);
      });

      server.once("listening", () => {
        server.close(() => resolve(port));
      });

      server.listen(port, "0.0.0.0");
    };

    tryPort(start);
  });
}

module.exports = { getFreePort };