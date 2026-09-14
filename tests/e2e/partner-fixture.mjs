// Isolated, read-only Partner transport fixtures. Never uses real credentials.
import { createServer } from "node:http";
let state = "published";
createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1:3216");
  if (url.pathname === "/fixture-state" && request.method === "POST") { state = url.searchParams.get("state"); response.end("ok"); return; }
  if (url.pathname === "/health") { response.end("ok"); return; }
  if (url.pathname === "/api/v1/360/experiences" && request.method === "GET") {
    if (url.searchParams.get("external_resource_id") !== "sunset-villa-001") { response.writeHead(400); response.end(); return; }
    response.setHeader("Content-Type", "application/json");
    if (state === "unavailable") { response.writeHead(403); response.end(JSON.stringify({ detail: { message: "SECRET CONFIGURATION DETAIL" } })); return; }
    response.end(JSON.stringify({ items: [{ experience_id: "fixture-exp", public_id: "fixture-public", publication_status: state, external_resource_id: "sunset-villa-001" }] })); return;
  }
  // No Viewer simulation: focused tests prove host mount/unmount only.
  response.writeHead(404); response.end();
}).listen(3216, "127.0.0.1");
