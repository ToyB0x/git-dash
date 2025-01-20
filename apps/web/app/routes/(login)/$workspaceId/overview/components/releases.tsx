import { Card } from "@/components/Card";
import type { FC } from "react";
import Markdown from "react-markdown";
import { Link } from "react-router";
import type { loaderReleases } from "../loaders";

type Props =
  | {
      isDemo: true;
      releases?: [];
    }
  | {
      isDemo?: false;
      releases: Awaited<ReturnType<typeof loaderReleases>>;
    };

export const Releases: FC<Props> = ({ isDemo, releases }) => (
  <section aria-labelledby="releases">
    <h1 className="mt-8 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
      Recent Releases
    </h1>

    <p className="mt-1 text-gray-500">
      for more details, click on the repository links.
    </p>

    {isDemo ? <SampleCards /> : <ReleaseCards releases={releases} />}
  </section>
);

const ReleaseCards = ({
  releases,
}: {
  releases: Awaited<ReturnType<typeof loaderReleases>>;
}) => (
  <>
    {releases.map(
      (release) =>
        release?.releaseUrl && (
          <Card className="mt-6 relative p-0 py-4" key={release.id}>
            {/*<div className="bg-gradient-to-t from-white via-white/50 to-transparent w-full h-20 absolute bottom-0 z-0" />*/}
            <div className="px-6 max-h-[14.5rem] overflow-y-hidden ">
              <h3 className="flex font-semibold text-gray-900 dark:text-gray-50">
                {release.authorAvatarUrl && (
                  <img
                    src={release.authorAvatarUrl}
                    alt="repository"
                    className="w-12 h-12 rounded-full"
                  />
                )}

                <div className="flex justify-center flex-col pl-4">
                  <p>
                    <a
                      href={release.releaseUrl}
                      className="underline underline-offset-4 text-lg"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {release.title}
                    </a>
                  </p>
                  <Link
                    to={`../repositories/${release.repositoryName}`}
                    className="underline underline-offset-4 text-sm text-gray-500"
                  >
                    {release.repositoryName}
                  </Link>
                </div>
              </h3>

              <div className="mt-4 text-sm leading-6 text-gray-900 dark:text-gray-50">
                <Markdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-md font-bold">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-md font-bold">{children}</h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6">{children}</ul>
                    ),
                    strong: ({ children }) => (
                      <span className="font-semibold">{children}</span>
                    ),
                  }}
                >
                  {/* remove html comment */}
                  {release.body?.replaceAll(/<!--[\s\S]*?-->/g, "")}
                </Markdown>
              </div>
            </div>
          </Card>
        ),
    )}
  </>
);

const SampleCards = () => (
  <>
    <Card className="mt-6">
      <h3 className="flex font-semibold text-gray-900 dark:text-gray-50">
        <img
          src="https://i.pravatar.cc/300"
          alt="repository"
          className="w-12 h-12 rounded-full"
        />
        <div className="flex justify-center flex-col pl-4">
          <p>Release v2.1.3 🎉</p>
          <Link
            to="../repositories/org/frontend"
            className="underline underline-offset-4 text-sm"
          >
            org/frontend
          </Link>
        </div>
      </h3>
      <p className="mt-2 text-sm leading-6 text-gray-900 dark:text-gray-50">
        What's Changed
      </p>
      <ul className="hidden text-sm leading-6 text-gray-900 sm:block dark:text-gray-50 list-disc pl-6">
        <li>chore(deps): upgrade remix to v2 by @user in #1212</li>
        <li>fix(ui): fix minor UI bug in the app by @user in #1211</li>
        <li>feat(ui): add new UI component to the app by @user in #1210</li>
      </ul>
    </Card>

    <Card className="mt-6">
      <h3 className="flex font-semibold text-gray-900 dark:text-gray-50">
        <img
          src="https://i.pravatar.cc/301"
          alt="repository"
          className="w-12 h-12 rounded-full"
        />
        <div className="flex justify-center flex-col pl-4">
          <p>Release v9.5.4 🎉</p>
          <Link
            to="../repositories/org/api"
            className="underline underline-offset-4 text-sm"
          >
            org/api
          </Link>
        </div>
      </h3>
      <p className="mt-2 text-sm leading-6 text-gray-900 dark:text-gray-50">
        What's Changed
      </p>
      <ul className="hidden text-sm leading-6 text-gray-900 sm:block dark:text-gray-50 list-disc pl-6">
        <li>feat(app): add new feature to the app by @user in #941</li>
        <li>fix(app): fix minor bug in the app by @user in #940</li>
        <li>fix(deps): fix broken dependency by @renovate in #939</li>
      </ul>
    </Card>
  </>
);
