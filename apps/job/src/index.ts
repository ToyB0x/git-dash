import { Command } from "commander";
import { makeAggregateCommand } from "./commands";

const main = async () => {
  const program = new Command();
  program.addCommand(makeAggregateCommand());

  try {
    await program.parseAsync();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();
