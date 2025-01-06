import type { getOctokit } from "@/clients";

export const checkUserOrOrganization = async (
  namespace: string,
  octokit: Awaited<ReturnType<typeof getOctokit>>,
): Promise<"User" | "Organization"> => {
  const result = await octokit.rest.users.getByUsername({
    username: namespace,
  });

  switch (result.data.type) {
    case "User":
      return "User";
    case "Organization":
      return "Organization";
    default:
      throw new Error("Unknown namespace type");
  }
};
