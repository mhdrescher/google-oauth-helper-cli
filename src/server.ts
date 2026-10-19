import { createServer } from "node:http";
import { URL } from "node:url";

export const getCode = (port: number) => {
  return new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      const params = new URL(req.url ?? "", `http://localhost:${port}`)
        .searchParams;
      const code = params.get("code");
      const error = params.get("error");

      // stray probes or a favicon.ico. Ignored.
      if (!code && !error) {
        res.end("ignored");
        return;
      }

      res.end("<h1>Done, you can close the tab now");
      server.close();

      if (code) {
        resolve(code);
      } else {
        reject(new Error(error ?? "no code and no error"));
      }
    });
    server.listen(port);
  });
};
