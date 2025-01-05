import { auth, hc } from "@/clients";
import {Button} from "@/components/Button";
import { SortableTable } from "@/components/ui/SortableTable";
import type { Route } from "@@/(login)/$workspaceId/settings/members/+types/page";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Link, redirect } from "react-router";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const membersResponse = await hc.api.members[":workspaceId"].$get(
    {
      param: {
        workspaceId: params.workspaceId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
      },
    },
  );

  if (!membersResponse.ok) throw Error("Failed to fetch");

  return {
    members: await membersResponse.json(),
  };
}

export async function clientAction({ params }: Route.ClientActionArgs) {
  await auth.authStateReady();
  if (!auth.currentUser) throw redirect("/sign-in");

  const { workspaceId } = params;

  const res = await hc.api.workspaces.$patch(
    {
      json: {
        id: workspaceId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
      },
    },
  );

  if (!res.ok) throw Error("Failed to create a workspace");

  return await res.json();
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { members } = loaderData;

  const currentMemberTable = useReactTable({
    data: members.filter((m) => !m.inviting),
    columns: [
      {
        header: "User",
        accessorKey: "email",
        enableSorting: true,
      },
      {
        header: "Role",
        accessorKey: "role",
        enableSorting: true,
      },
      {
        header: "Last Updated",
        accessorFn: ({ updatedAt }) =>
          updatedAt && new Date(updatedAt).toDateString(),
        enableSorting: true,
      },
      {
        header: "",
        accessorKey: "id",
        enableSorting: false,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
        cell: ({ row }) => (
          <Link
            to={`${row.original.id}`}
            className="underline underline-offset-4"
          >
            Edit
          </Link>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          id: "email",
          desc: false,
        },
      ],
    },
  });

  const invitingUserTable = useReactTable({
    data: members.filter((m) => !!m.inviting),
    columns: [
      {
        header: "User",
        accessorKey: "email",
        enableSorting: true,
      },
      {
        header: "Role",
        accessorKey: "role",
        enableSorting: true,
      },
      {
        header: "Last Updated",
        accessorFn: ({ updatedAt }) =>
          updatedAt && new Date(updatedAt).toDateString(),
        enableSorting: true,
      },
      {
        header: "",
        accessorKey: "id",
        enableSorting: false,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
        cell: ({ row }) => (
          <Link
            to={`${row.original.id}`}
            className="underline underline-offset-4"
          >
            Edit
          </Link>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          id: "email",
          desc: false,
        },
      ],
    },
  });

  return (
    <div>
      <p className="text-gray-500">
        Workspace owners can add, manage, and remove members.
      </p>

      <div className="flex justify-end">
        <Button asChild  className="mt-6">
          <Link to="new">Add Member</Link>
        </Button>
      </div>

      <section className="flex flex-col space-y-2">
        <h2 className="text-xl">Members</h2>
        <SortableTable table={currentMemberTable} />
      </section>

      {members.filter((m) => m.inviting).length > 0 && (
      <section className="flex flex-col space-y-2 mt-24">
        <h2 className="text-xl">Inviting</h2>
        <SortableTable table={invitingUserTable}/>
      </section>
        )}
    </div>
  );
}