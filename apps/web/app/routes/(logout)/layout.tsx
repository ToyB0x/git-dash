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
          <p className="mt-4 text-sm ">
            You can try the live demo with the
            <a
              href="/demo"
              className="underline underline-offset-4 pl-1"
              target="_blank"
              rel="noreferrer"
            >
              Demo Page
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
