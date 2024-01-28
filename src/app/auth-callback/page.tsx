import { redirect, useRouter, useSearchParams } from "next/navigation";

const page = () => {
  // extract the origin query param from the URL
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  // sync the user in kinde session to our db

  // redirect back to the origin
  redirect(`/${origin}`);
};

export default page;
