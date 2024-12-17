import { Command } from "commander";
import {
  newAggregateCommand,
  newCheckCommand,
  newExportCommand,
  newReportCommand,
} from "./commands";

const main = async () => {
  const program = new Command();
  program.addCommand(newAggregateCommand());
  program.addCommand(newCheckCommand());
  program.addCommand(newExportCommand());
  program.addCommand(newReportCommand());

  try {
    await program.parseAsync();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();
