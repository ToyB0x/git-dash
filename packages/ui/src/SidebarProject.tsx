import { Box } from "@chakra-ui/react";
import type { FC } from "react";
import { Link } from "react-router";

type LinkItem = {
  name: string;
  href: string;
};

const linkItems: LinkItem[] = [
  { name: "Dashboard", href: "" },
  { name: "PRs", href: "prs" },
  { name: "Reviews", href: "reviews" },
];

type Props = {
  projectId: string;
};

export const SidebarProject: FC<Props> = ({ projectId }) => {
  return (
    <Box
      h="100vh"
      w="12rem"
      pos="sticky"
      py={2}
      px={4}
      borderRight="1px"
      borderRightColor="gray.200"
    >
      <Link to="/">
        <Box fontSize="4xl" fontWeight="bold" fontFamily="monospace">
          git-dash
        </Box>
      </Link>

      {linkItems.map((link) => (
        <Link to={`${projectId}/${link.href}`} key={link.name}>
          <Box ml={1} my={2} display="block" fontSize="lg">
            {link.name}
          </Box>
        </Link>
      ))}
    </Box>
  );
};
