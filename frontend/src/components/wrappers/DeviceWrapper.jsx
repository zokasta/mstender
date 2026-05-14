import { Monitor, Laptop, Smartphone } from "lucide-react";

export default function DeviceWrapper({ children }) {
  const isMobileOrTablet = window.innerWidth < 1024;

  if (isMobileOrTablet) {
    return (
      <div className="min-h-screen bg-surface-soft dark:bg-surface-dark flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
            
            {/* Glow */}
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-primary-500/10 rounded-full blur-3xl" />

            {/* Icon */}
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                <Laptop
                  size={42}
                  className="text-primary-500"
                />
              </div>

              {/* Small floating icons
              <div className="flex items-center justify-center gap-4 mt-5 opacity-70">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-surface-darkMuted flex items-center justify-center">
                  <Smartphone
                    size={20}
                    className="text-gray-400"
                  />
                </div>

                <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Monitor size={24} />
                </div>
              </div> */}

              {/* Text */}
              <h1 className="mt-8 text-3xl font-black text-gray-800 dark:text-white">
                Desktop Only
              </h1>

              <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                This ERP platform is optimized for laptops and desktop
                computers to provide the best experience for managing your
                business workflows, reports, invoices, customers, and
                transactions.
              </p>

              {/* Warning Box */}
              <div className="mt-6 bg-primary-500/5 border border-primary-500/10 rounded-2xl p-4">
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                  Please login using a laptop or desktop computer.
                </p>
              </div>

              {/* Footer */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                Enterprise Resource Platform
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}