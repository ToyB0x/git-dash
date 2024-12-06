import { Hono } from "hono";
import { postHandler } from "./post";

export const reportRoute = new Hono().post("", ...postHandler); // URLからはTypeの推測ができないためParse処理が重くなる可能性がある(その場合は /:type などでパスにTypeも含めてTypeごとにParse処理を切り替える)
