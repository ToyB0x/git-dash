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

// const destination = pino.destination({
//   sync: true,
// });

export const logger = pino(transports);
logger.level = "trace";

// NOTE:
// ref: https://stackoverflow.com/a/70880356
// ref: https://github.com/pinojs/pino/blob/main/docs/api.md#transport-object
// > If the transport option is supplied to pino, a destination parameter may not also be passed as a separate argument to pino:
// > pino({ transport: {}}, '/path/to/somewhere') // THIS WILL NOT WORK, DO NOT DO THIS
// > pino({ transport: {}}, process.stderr) // THIS WILL NOT WORK, DO NOT DO THIS
