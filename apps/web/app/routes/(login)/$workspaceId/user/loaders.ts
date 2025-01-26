import type { getWasmDb } from "@/clients";
import { prTbl, reviewCommentTbl, userTbl } from "@git-dash/db";
import { and, asc, eq, gte, sql } from "drizzle-orm";

export type User = {
  id: number;
  login: string;
  name: string | null;
  blog: string | null;
  avatarUrl: string;
  prs: number;
  reviews: number;
};

export const sampleUsers = [
  {
    id: 1,
    login: "C0d3r",
    name: "John Doe",
    blog: "https://example.com",
    avatarUrl: "https://i.pravatar.cc/300",
    prs: 123,
    reviews: 125,
  },
  {
    id: 2,
    login: "QuickSilver91",
    name: null,
    blog: "https://example2.com",
    avatarUrl: "https://i.pravatar.cc/301",
    prs: 96,
    reviews: 93,
  },
  {
    id: 3,
    login: "Rock3tMan",
    name: "Peter Parker",
    blog: "https://example3.com",
    avatarUrl: "https://i.pravatar.cc/302",
    prs: 66,
    reviews: 53,
  },
  {
    id: 4,
    login: "BananaEat3r",
    name: "Tony Stark",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/303",
    prs: 46,
    reviews: 33,
  },
  {
    id: 5,
    login: "Xg3tt3r",
    name: "Bruce Wayne",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/304",
    prs: 26,
    reviews: 23,
  },
  {
    id: 6,
    login: "Xbox231",
    name: "Clark Kent",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/305",
    prs: 16,
    reviews: 13,
  },
  {
    id: 7,
    login: "WhoAmI",
    name: null,
    blog: null,
    avatarUrl: "https://i.pravatar.cc/306",
    prs: 6,
    reviews: 3,
  },
  {
    id: 8,
    login: "Wat3r",
    name: "Barry Allen",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/307",
    prs: 3,
    reviews: 1,
  },
  {
    id: 9,
    login: "Plat1num",
    name: "Hal Jordan",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/308",
    prs: 1,
    reviews: 0,
  },
  {
    id: 10,
    login: "Gold3n",
    name: null,
    blog: null,
    avatarUrl: "https://i.pravatar.cc/309",
    prs: 1,
    reviews: 0,
  },
  {
    id: 11,
    login: "B1u3",
    name: "Arthur Curry",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/310",
    prs: 1,
    reviews: 0,
  },
] satisfies User[];

export const loaderUsers = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  const halfYearAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);

  // ref: https://www.answeroverflow.com/m/1095781782856675368
  const users = await db
    .select({
      id: userTbl.id,
      login: userTbl.login,
      name: userTbl.name,
      blog: userTbl.blog,
      avatarUrl: userTbl.avatarUrl,
      // prs: sql<number>`count(${prTbl.authorId})`,
      prs: db.$count(
        prTbl,
        and(eq(userTbl.id, prTbl.authorId), gte(prTbl.createdAt, halfYearAgo)),
      ),
    })
    .from(userTbl)
    .leftJoin(prTbl, eq(userTbl.id, prTbl.authorId))
    .groupBy(prTbl.authorId);

  // ref: https://www.answeroverflow.com/m/1095781782856675368
  const reviews = await db
    .select({
      userId: reviewCommentTbl.reviewerId,
      count: sql<number>`cast(count(${reviewCommentTbl.id}) as int)`,
    })
    .from(reviewCommentTbl)
    .where(gte(reviewCommentTbl.createdAt, halfYearAgo))
    .groupBy(reviewCommentTbl.reviewerId);

  return users
    .filter((user) => !user.login.startsWith("renovate"))
    .map((user) => {
      const review = reviews.find((review) => review.userId === user.id);
      return {
        ...user,
        reviews: review?.count ?? 0,
      };
    }) satisfies User[];
};

export const loaderMaxOldPr = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => await db.select().from(prTbl).orderBy(asc(prTbl.createdAt)).get();

export const loaderMaxOldReview = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) =>
  await db
    .select()
    .from(reviewCommentTbl)
    .orderBy(asc(reviewCommentTbl.createdAt))
    .get();
