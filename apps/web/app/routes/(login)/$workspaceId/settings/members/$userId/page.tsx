import { auth, hc } from "@/clients";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import type { Route } from "@@/(login)/$workspaceId/settings/members/new/+types/page";
import { Roles } from "@git-dash/db-api/schema";
import { Form, redirect } from "react-router";

export async function clientLoader() {
  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }
}

export async function clientAction({
                                     params,
                                     request,
                                   }: Route.ClientActionArgs) {
  await auth.authStateReady();
  if (!auth.currentUser) throw redirect("/sign-in");

  const { workspaceId } = params;

  const formData = await request.formData();

  const email = formData.get("email");
  if (typeof email !== "string") throw Error("email is invalid");

  const role = formData.get("role");
  if (typeof role !== "string") throw Error("role is invalid");

  const res = await hc.api.members[":workspaceId"].$post(
      {
        param: { workspaceId },
        json: {
          role: role as never,
          email,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        },
      },
  );

  if (!res.ok) throw Error("Failed to create a workspace");

  return redirect("../members")
}

export default function Page() {
  return (
      <div>
        <p className="text-gray-500">
          Workspace owners can add, manage, and remove members.
        </p>

        <Form
            method="POST"
            className="flex flex-col space-y-8 mt-28 w-96 mx-auto"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
                placeholder="Enter email"
                id="email"
                name="email"
                type="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Select size</Label>
            <Select name="role">
              <SelectTrigger id="size" className="mt-2">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Roles.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="ml-auto" disabled>
            Update
          </Button>
        </Form>
      </div>
  );
}