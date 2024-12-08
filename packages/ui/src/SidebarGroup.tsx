import { Box, Spacer, Stack } from "@chakra-ui/react";
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
  groupId: string;
};

export const SidebarGroup: FC<Props> = ({ groupId }) => {
  return (
    <Stack
      h="100vh"
      w="12rem"
      pos="sticky"
      py={2}
      px={4}
      borderRight="1px"
      borderRightColor="gray.200"
    >
      <Box>
        <Link to="/">
          <Box fontSize="4xl" fontWeight="bold" fontFamily="monospace">
            git-dash
          </Box>
        </Link>

        {linkItems.map((link) => (
          <Link to={`${groupId}/${link.href}`} key={link.name}>
            <Box ml={1} my={2} display="block" fontSize="lg">
              {link.name}
            </Box>
          </Link>
        ))}
      </Box>
      <Spacer />
      <Box>version (0.0.1-alpha)</Box>
    </Stack>
  );
};
