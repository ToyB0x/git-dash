import process from "node:process";
import { readConfigs } from "@/env";
import { Command } from "commander";
import { aggregateAll } from "./aggregate";

export const newAggregateCommand = () => {
  const aggregate = new Command("aggregate");
  aggregate.description("aggregate related commands.");

  aggregate
    .command("organization")
    .description("aggregate specific organization repositories.")
    .action(
      async () =>
        await aggregateAll(
          readConfigs({
            // biome-ignore lint/complexity/useLiteralKeys: <explanation>
            GDASH_MODE: process.env["GDASH_MODE"],
            env: process.env,
          }),
        ),
    );

  return aggregate;
};
