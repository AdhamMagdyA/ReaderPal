"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";

const page = () => {
  // extract the origin query param from the URL
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  // sync the user in kinde session to our db
  const { data, isLoading } = trpc.authCallback.useQuery();

  if (!isLoading) {
    if (data?.success) {
      router.push(origin || "/dashboard");
    } else {
      // redirect to the kinde login page
      router.push("api/auth/login");
    }
  }

  return (
    <div className="w-full mt-24 flex  justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl"> Preparing your account... </h3>
        <p>you will be redirect automatically</p>
      </div>
    </div>
  );
};

export default page;
