import { Outlet } from "react-router";

export default function layout() {
  return (
    <div className="lg:flex h-screen w-screen">
      <div className="bg-white dark:bg-gray-950 lg:w-[50%]">
        <Outlet />
      </div>
      <div className="bg-gray-950 lg:w-[50%]">
        <Right />
      </div>
    </div>
  );
}

function Right() {
  return (
    <>
      {/*TODO: update banner form tremor repository sample image to custom image*/}
      <div className="bg-cover bg-center bg-no-repeat bg-[url('/login-banner.png')]">
        <div className="h-screen backdrop-blur-md backdrop-brightness-50 flex justify-center flex-col text-center text-gray-100">
          <h3 className=" text-lg font-semibold">Live Demo</h3>
          <p className="mt-4 text-sm">
            You can try the live demo with the following links.
            <br />
            (Examples:
            <a
              href="/demo/cost"
              className="underline underline-offset-4 text-xs ml-2"
              target="_blank"
              rel="noreferrer"
            >
              Cost
            </a>
            &nbsp;&nbsp;/
            <a
              href="/demo/users/QuickSilver91"
              className="underline underline-offset-4 text-xs ml-2"
              target="_blank"
              rel="noreferrer"
            >
              User
            </a>
            &nbsp;&nbsp;/
            <a
              href="/demo/vulns"
              className="underline underline-offset-4 text-xs ml-2"
              target="_blank"
              rel="noreferrer"
            >
              Vuln
            </a>
            &nbsp;&nbsp;/
            <a
              href="/demo/repositories/org/api"
              className="underline underline-offset-4 text-xs ml-2"
              target="_blank"
              rel="noreferrer"
            >
              Four keys
            </a>
            )
          </p>
        </div>
      </div>
    </>
  );
}
