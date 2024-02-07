import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import React from "react";

const Page = async () => {
  // get the current user from the session
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  // if the user is logged in check if they exist in our db
  let dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser)
    dbUser = await db.user.create({
      data: {
        id: user.id,
        email: user.email!,
        picture: user.picture,
        name: user.given_name,
      },
    });

  return <Dashboard />;
};

export default Page;
