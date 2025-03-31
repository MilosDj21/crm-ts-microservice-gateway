import "dotenv/config";

import { createApp } from "./createApp";

const app = createApp();

//starting express server
app.listen(process.env.PORT, () =>
  console.log(`Listening on port: ${process.env.PORT}`),
);
