import { Command } from "commander";
import { makeAggregateCommand, makeMigrateCommand } from "./commands";

const main = async () => {
  const program = new Command();
  program.addCommand(makeAggregateCommand());
  program.addCommand(makeMigrateCommand());

  try {
    await program.parseAsync();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();
