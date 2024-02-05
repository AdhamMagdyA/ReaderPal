import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types";
import React from "react";

const Dashboard = ({ user }: { user: KindeUser }) => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Hi {user?.given_name}!</p>
    </div>
  );
};

export default Dashboard;
