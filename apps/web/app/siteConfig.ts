export const siteConfig = {
  name: "Dashboard",
  url: "https://dashboard.tremor.so",
  description: "The only dashboard you will ever need.",
  baseLinks: {
    overview: "overview",
    overview2: "overview2",
    fourkeys: "fourkeys",
    cost: "cost",
    vulns: "vulns",
    releases: "releases",
    prs: "prs",
    reviews: "reviews",
    users: "users",
    repositories: "repositories",
  },
  externalLink: {
    blocks: "https://blocks.tremor.so/templates#dashboard",
  },
};

export type siteConfig = typeof siteConfig;
