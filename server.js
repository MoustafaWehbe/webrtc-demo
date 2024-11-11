const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");
const path = require("path");
const express = require("express");

const app = express();
const options = {
  key: fs.readFileSync("./certs/create-cert-key.pem"),
  cert: fs.readFileSync("./certs/create-cert.pem"),
};

// Serve static files (e.g., index.html) from the current directory
app.use(express.static(path.join(__dirname)));

// Create an HTTPS server
const httpsServer = https.createServer(options, app);
httpsServer.listen(8443, () => {
  console.log("HTTPS server running at https://localhost:8443");
});

const wss = new WebSocket.Server({ server: httpsServer });

wss.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("message", (message) => {
    const obj = JSON.parse(message);

    wss.clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(obj));
      }
    });
  });
  socket.on("close", () => {
    console.log("Client disconnected");
  });
});
