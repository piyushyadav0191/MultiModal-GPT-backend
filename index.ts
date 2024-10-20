import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { initVectorStore } from "./lib/vector-store-initialzation";

const PORT = process.env.PORT || 3000;

let server;

server = app.listen(PORT, () => {
  initVectorStore();
  console.log(`Server is running on port ${PORT}`);
});

const exitHandler = () => {
  if (server) {
    console.info("Server closed.");
    process.exit(1);
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: any) => {
  console.error(error);
  exitHandler();
};
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  if (server) {
    console.info("Server closed.");
    process.exit(1);
  }
});
