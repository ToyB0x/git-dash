import { Command } from "commander";
import { makeAggregateCommand, makeExportCommand } from "./commands";

const main = async () => {
  const program = new Command();
  program.addCommand(makeAggregateCommand());
  program.addCommand(makeExportCommand());

  try {
    await program.parseAsync();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();
