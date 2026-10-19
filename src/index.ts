import "dotenv/config";
import crypto from "node:crypto";
import * as readline from "node:readline/promises";
import { URLSearchParams } from "node:url";
import { getCode } from "./server.ts";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const main = async () => {
  const clientId =
    process.env.CLIENT_ID ||
    (await rl.question("No CLIENT_ID found. Add client id: "));
  const clientSecret =
    process.env.CLIENT_SECRET ||
    (await rl.question("No CLIENT_SECRET found. Add client secret: "));
  const port =
    process.env.PORT || (await rl.question("No PORT found. Add a free port: "));
  const redirectUri = `http://localhost:${port}`;

  const codeVerifier = Buffer.from(
    "super-sicherer-token-der-echt-super-lang-ist-und-mehr-als-43-zeichen-hat",
  ).toString("base64url");
  const codeChallenge = crypto.hash("sha256", codeVerifier, "base64url");

  const searchParams = new URLSearchParams({
    scope: "https://www.googleapis.com/auth/drive",
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "offline",
  });

  const code = getCode(Number(port));
  console.log(
    `Go to the following URL:\n\nhttps://accounts.google.com/o/oauth2/v2/auth?${searchParams}`,
  );

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: await code,
    code_verifier: codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  }).then((res) => res.json());
  console.log(res);
  rl.close();
};

await main();
