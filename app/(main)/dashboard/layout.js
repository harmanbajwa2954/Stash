import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";
import { checkUser } from "@/lib/checkUser";

const DashboardLayout = async ({ children }) => {
  await checkUser();

  return (
    <div className="px-5">
      <h1 className="text-6xl font-bold gradient gradient-title mb-5">
        Dashboard
      </h1>
      <Suspense
        fallback={
          <BarLoader className="mt-4" width={"100%"} color="#9333EA" />
        }
      >
        {children}
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
