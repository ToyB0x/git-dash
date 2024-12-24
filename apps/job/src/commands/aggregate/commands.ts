import { Command } from "commander";
import { aggregateByOrganization } from "./aggregate";

export const newAggregateCommand = () => {
  const aggregate = new Command("aggregate");
  aggregate.description("aggregate related commands.");

  aggregate
    .command("organization")
    .description("aggregate specific organization repositories.")
    .action(async () => await aggregateByOrganization());

  return aggregate;
};
