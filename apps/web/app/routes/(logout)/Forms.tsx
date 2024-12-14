import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { RiGoogleFill } from "@remixicon/react";
import { Form, Link } from "react-router";

export default function Forms({
  isSignedIn,
}: {
  isSignedIn: boolean;
}) {
  return (
    <>
      <div className="flex min-h-screen flex-1 flex-col justify-center px-4 lg:px-6">
        <div className="mx-auto w-full max-w-sm">
          <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-gray-50">
            {isSignedIn ? "Sign in to your account" : "Create your new account"}
          </h3>
          <p className="text-xs mt-4 text-center text-gray-500">
            {isSignedIn ? "Don't have an account?" : "Already have an account?"}
            <Link
              to={isSignedIn ? "/sign-up" : "/sign-in"}
              className="ml-1 underline underline-offset-4"
            >
              {isSignedIn ? "Sign up" : "Sign in"}
            </Link>
          </p>
          <Form method="post" className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email" className="font-medium">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder="john@company.com"
                className="mt-2"
              />
            </div>
            <div>
              <div className="pt-2 font-medium flex justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-xs text-gray-500 font-light">
                  <Link
                    to="/forgot-password"
                    className="ml-1 underline underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </span>
              </div>
              <Input
                type="password"
                id="password"
                name="password"
                autoComplete="password"
                placeholder="Password"
                className="mt-2"
              />
            </div>
            <Button type="submit" className="mt-4 w-full">
              {isSignedIn ? "Sign in" : "Sign up"}
            </Button>
          </Form>
          <Divider>or with</Divider>
          <Button asChild variant="secondary" className="w-full">
            <a href="/" className="inline-flex items-center gap-2">
              <RiGoogleFill className="size-5" aria-hidden={true} />
              {isSignedIn ? "Sign in" : "Sign up"} with Google
            </a>
          </Button>
          <p className="mt-4 text-xs text-gray-500">
            By signing {isSignedIn ? "in" : "up"}, you agree to our{" "}
            <a href="/" className="underline underline-offset-4">
              terms of service
            </a>{" "}
            and{" "}
            <a href="/" className="underline underline-offset-4">
              privacy policy
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
