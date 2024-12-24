export const calcActionsCostFromTime = ({
  runner,
  milliSec,
}: { runner: string; milliSec: number }) => {
  const minutes = Math.ceil(milliSec / (1000 * 60));
  // https://docs.github.com/ja/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions#per-minute-rates-for-standard-runners
  switch (runner) {
    case "UBUNTU":
      return {
        runner,
        cost: minutes * 0.008,
      };
    case "MACOS":
      return {
        runner,
        cost: minutes * 0.08,
      };
    case "WINDOWS":
      return {
        runner,
        cost: minutes * 0.016,
      };
    case "ubuntu_4_core":
      return {
        runner,
        cost: minutes * 0.016,
      };
    case "ubuntu_8_core":
      return {
        runner,
        cost: minutes * 0.032,
      };
    case "ubuntu_16_core":
      return {
        runner,
        cost: minutes * 0.064,
      };
    case "ubuntu_32_core":
      return {
        runner,
        cost: minutes * 0.128,
      };
    case "ubuntu_64_core":
      return {
        runner,
        cost: minutes * 0.256,
      };
    case "windows_4_core":
      return {
        runner,
        cost: minutes * 0.032,
      };
    case "windows_8_core":
      return {
        runner,
        cost: minutes * 0.064,
      };
    case "windows_16_core":
      return {
        runner,
        cost: minutes * 0.128,
      };
    case "windows_32_core":
      return {
        runner,
        cost: minutes * 0.256,
      };
    case "windows_64_core":
      return {
        runner,
        cost: minutes * 0.512,
      };
    case "macos_12_core":
      return {
        runner,
        cost: minutes * 0.12,
      };
    case "total":
      return null; // ignore total
    default:
      throw Error("Please Add Runner Type");
  }
};
