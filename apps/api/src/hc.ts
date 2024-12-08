import { hc } from "hono/client";
import type { app } from "./app";

// assign the client to a variable to calculate the type when compiling
const client = hc<typeof app>("");
export type Client = typeof client;

// ref: https://github.com/m-shaka/hono-rpc-perf-tips-example/tree/main
export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args);
