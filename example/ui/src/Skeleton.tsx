import {
  Skeleton as ChakraSkeleton,
  type SkeletonProps,
} from "@chakra-ui/react";
import type { FC } from "react";

export const Skeleton: FC<SkeletonProps> = (props) => {
  return <ChakraSkeleton borderRadius={5} {...props} />;
};
