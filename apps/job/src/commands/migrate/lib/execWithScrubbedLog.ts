export const execWithScrubbedLog = (
  execSync: (command: string) => Buffer,
  command: string,
): void => {
  try {
    const stdout = execSync(command)
    console.log(stdout.toString())
    console.log('Command completed successfully.')
  } catch (e: any & { stdout: Buffer; stderr: Buffer }) {
    // NOTE: hide DATABASE_URL on error for security reasons
    if (
      e.stdout.toString().includes('DATABASE_URL') ||
      e.stdout.toString().includes('postgresql://')
    ) {
      console.info(
        "Log is masked because this error message includes 'DATABASE_URL' or 'postgresql://'.",
        '**********',
      )
    } else {
      console.info(e.stdout.toString())
    }

    if (
      e.stderr.toString().includes('DATABASE_URL') ||
      e.stderr.toString().includes('postgresql://')
    ) {
      console.error(
        "Log is masked because this error message includes 'DATABASE_URL' or 'postgresql://'.",
        '**********',
      )
    } else {
      console.error(e.stderr.toString())
    }
    process.exit(1)
  }
}
