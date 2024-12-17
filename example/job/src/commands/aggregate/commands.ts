import { Command } from "commander";
import { aggregateByOrganization } from "./aggregateByOrganization";

export const makeAggregateCommand = () => {
  const aggregate = new Command("aggregate");
  aggregate.description("aggregate related commands.");

  aggregate
    .command("organization")
    .description("aggregate specific organization repositories.")
    .argument("<orgName>", "orgName to aggregate repositories")
    .action(async (orgName: string) => await aggregateByOrganization(orgName));

  return aggregate;
};
