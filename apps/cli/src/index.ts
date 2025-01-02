import { Command } from "commander";
import {
  newAggregateCommand,
  newCheckCommand,
  newDbCommand,
  newExportCommand,
  newSampleCommand,
} from "./commands";

const main = async () => {
  const program = new Command();
  program.addCommand(newAggregateCommand());
  program.addCommand(newCheckCommand());
  program.addCommand(newExportCommand());
  program.addCommand(newDbCommand());
  program.addCommand(newSampleCommand());

  try {
    await program.parseAsync();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();
