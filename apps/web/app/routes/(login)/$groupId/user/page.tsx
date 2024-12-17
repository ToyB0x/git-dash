import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";
import { Link } from "react-router";

const dataTable = [
  {
    user: "C0d3r",
    avatar: "https://i.pravatar.cc/300",
    prs: 123,
    reviews: 125,
    lastActivity: "23/09/2024 13:00",
  },
  {
    user: "QuickSilver91",
    avatar: "https://i.pravatar.cc/301",
    prs: 96,
    reviews: 93,
    lastActivity: "22/09/2024 10:45",
  },
  {
    user: "Rock3tMan",
    avatar: "https://i.pravatar.cc/302",
    prs: 66,
    reviews: 53,
    lastActivity: "22/09/2024 10:45",
  },
  {
    user: "BananaEat3r",
    avatar: "https://i.pravatar.cc/303",
    prs: 46,
    reviews: 33,
    lastActivity: "21/09/2024 14:30",
  },
  {
    user: "Xg3tt3r",
    avatar: "https://i.pravatar.cc/304",
    prs: 26,
    reviews: 23,
    lastActivity: "24/09/2024 09:15",
  },
  {
    user: "Xbox231",
    avatar: "https://i.pravatar.cc/305",
    prs: 16,
    reviews: 13,
    lastActivity: "24/09/2024 09:15",
  },
  {
    user: "WhoAmI",
    avatar: "https://i.pravatar.cc/306",
    prs: 6,
    reviews: 3,
    lastActivity: "24/09/2024 09:15",
  },
  {
    user: "Wat3r",
    avatar: "https://i.pravatar.cc/307",
    prs: 3,
    reviews: 1,
    lastActivity: "24/09/2024 09:15",
  },
  {
    user: "Plat1num",
    avatar: "https://i.pravatar.cc/308",
    prs: 1,
    reviews: 0,
    lastActivity: "24/09/2024 09:15",
  },
  {
    user: "Gold3n",
    avatar: "https://i.pravatar.cc/309",
    prs: 1,
    reviews: 0,
    lastActivity: "24/09/2024 09:15",
  },
  {
    user: "B1u3",
    avatar: "https://i.pravatar.cc/310",
    prs: 1,
    reviews: 0,
    lastActivity: "24/09/2024 09:15",
  },
];

export default function Page() {
  return (
    <section aria-labelledby="users-table">
      <h1
        id="users-table"
        className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
      >
        Users in repositories
      </h1>
      <p className="mt-1 text-gray-500">
        for more details , click on the user links.
      </p>
      <TableRoot className="mt-8">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-1">User</TableHeaderCell>
              <TableHeaderCell />
              <TableHeaderCell className="text-right">PRs</TableHeaderCell>
              <TableHeaderCell className="text-right">Reviews</TableHeaderCell>
              <TableHeaderCell className="text-right">
                Last Activity
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataTable.map((item) => (
              <TableRow key={item.user}>
                <TableCell className="p-0">
                  <img
                    src={item.avatar}
                    alt="user"
                    className="w-8 h-8 rounded-full"
                  />
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                  <Link
                    to={`${item.user}`}
                    className="underline underline-offset-4"
                  >
                    {item.user}
                  </Link>
                </TableCell>
                <TableCell className="text-right">{item.prs}</TableCell>
                <TableCell className="text-right">{item.reviews}</TableCell>
                <TableCell className="text-right">
                  {item.lastActivity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableRoot>
    </section>
  );
}
