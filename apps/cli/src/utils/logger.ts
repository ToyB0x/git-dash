import pino from "pino";

const transports = pino.transport({
  targets: [
    {
      level: "info",
      target: "pino-pretty",
    },
    {
      level: "trace",
      target: "pino/file",
      options: { destination: `logs/${Date.now()}.log`, mkdir: true },
    },
  ],
});

const destination = pino.destination({
  sync: true,
});

export const logger = pino({ ...transports, ...destination });
logger.level = "trace";
