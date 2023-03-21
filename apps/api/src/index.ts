import { createServer } from "./server";

async function main() {
  const port = process.env.PORT || 3001;
  const server = await createServer();

  server.listen(port, () => {
    console.log(`api running on ${port}`);
  });
}

main();
