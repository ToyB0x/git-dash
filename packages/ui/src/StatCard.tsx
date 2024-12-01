import { Box, Flex, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  stat: string;
  icon?: ReactNode;
}

// ref: https://chakra-templates.dev/page-sections/statistics
export const StatCard = (props: StatsCardProps) => {
  const { title, stat, icon } = props;
  return (
    <Stat px={4} py="5" shadow="xl" rounded="lg" bg="white">
      <Flex justifyContent="space-between">
        <Box my="auto" ml={5} mr={3}>
          {icon}
        </Box>
        <Box ml={3} mr={5}>
          <StatLabel fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="medium">
            {stat}
          </StatNumber>
        </Box>
      </Flex>
    </Stat>
  );
};
