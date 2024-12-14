import { Outlet } from "react-router";

export default function layout() {
  return (
    <div className="md:flex h-screen w-[100%]">
      <div className="bg-white md:w-[50%]">
        <Outlet />
      </div>
      <div className="bg-gray-950 md:w-[50%]">
        <Right />
      </div>
    </div>
  );
}

// TODO: update banner form tremor repository sample image to custom image
import banner from "./img.png";

function Right() {
  return (
    <>
      <div className="flex min-h-screen flex-1 flex-col justify-center px-4 lg:px-6 text-gray-200">
        <div className="p-8">
          <h3 className="text-center text-lg font-semibold ">Live Demo</h3>
          <img
            src={banner}
            alt="dashboard sample"
            className="w-[100%] mt-2 border-gray-400 border rounded-lg"
          />
          <p className="mt-4 text-xs">
            You can try the live demo with the
            <a href="/demo" className="underline underline-offset-4 pl-1">
              Demo Page
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
