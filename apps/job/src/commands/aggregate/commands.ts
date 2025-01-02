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
            // NOTE: 既存のこのコマンドから呼び出すのは現時点ではORGANIZATION_APPのみ
            GDASH_MODE: "ORGANIZATION_APP",
            env: process.env,
          }),
        ),
    );

  return aggregate;
};
