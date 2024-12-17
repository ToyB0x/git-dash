import { env } from "@/env";
import { Command } from "commander";
import { aggregateByOrganization } from "./aggregateByOrganization";

export const newAggregateCommand = () => {
  const aggregate = new Command("aggregate");
  aggregate.description("aggregate related commands.");

  aggregate
    .command("organization")
    .description("aggregate specific organization repositories.")
    .action(
      async () =>
        await aggregateByOrganization(env.GDASH_GITHUB_ORGANIZATION_NAME),
    );

  return aggregate;
};
