import { useNavigate } from "react-router-dom";

import { FaTools, FaArrowLeft, FaHome } from "react-icons/fa";

import { MdOutlineUpdate } from "react-icons/md";

export default function Maintenance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-6 overflow-hidden relative">
      {/* ================================================= */}
      {/* BACKGROUND EFFECTS */}
      {/* ================================================= */}

      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* ================================================= */}
      {/* CARD */}
      {/* ================================================= */}

      <div className="relative bg-white dark:bg-surface-darkCard/80 backdrop-blur-xl border border-white shadow-2xl rounded-[40px] max-w-3xl w-full overflow-hidden">
        {/* TOP BAR */}

        <div className="h-3 bg-gradient-to-r from-primary-500 to-primary-300" />

        <div className="p-10 md:p-7">
          {/* ICON */}

          <div className="flex justify-center">
            <div className="w-28 h-28 rounded-full bg-primary-100 flex items-center justify-center shadow-inner border border-primary-200 animate-pulse">
              <FaTools className="text-5xl text-primary-500" />
            </div>
          </div>

          {/* TITLE */}

          <div className="mt-8 text-center">
            <h1 className="text-6xl font-black text-primary-500 tracking-tight md:text-4xl">
              Maintenance
            </h1>

            <h2 className="mt-3 text-2xl font-semibold text-primary-300 md:text-lg">
              We’re improving the system
            </h2>

            <p className="mt-6 text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
              Our ERP platform is currently under scheduled maintenance to
              improve performance, security, and stability. Please wait a little
              while and try again.
            </p>
          </div>

          {/* STATUS BOXES */}

          <div className="grid grid-cols-3 gap-5 mt-10 md:grid-cols-1">
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center">
                  <FaTools />
                </div>

                <div>
                  <h3 className="font-bold text-primary-500">System Upgrade</h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Improving infrastructure
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center">
                  <MdOutlineUpdate />
                </div>

                <div>
                  <h3 className="font-bold text-primary-500">New Features</h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">Updating modules</p>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center">
                  <FaHome />
                </div>

                <div>
                  <h3 className="font-bold text-primary-500">Back Soon</h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Service will resume shortly
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex items-center justify-center gap-5 mt-12 md:flex-col">
            <button
              onClick={() => navigate("/")}
              className="h-14 px-8 rounded-2xl bg-primary-500 hover:bg-primary-600 transition-all duration-200 text-white font-semibold flex items-center gap-3 shadow-lg shadow-primary-500/20"
            >
              <FaHome />
              Go Home
            </button>

            <button
              onClick={() => navigate(-1)}
              className="h-14 px-8 rounded-2xl border-2 border-primary-500 text-primary-500 hover:bg-primary-50 transition-all duration-200 font-semibold flex items-center gap-3"
            >
              <FaArrowLeft />
              Go Back
            </button>
          </div>

          {/* FOOTER */}

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-400">
              © 2026 ERP System • All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
