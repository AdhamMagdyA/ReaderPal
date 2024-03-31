// infer the type of the KindeUser

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const { getUser } = getKindeServerSession();
type UserType = typeof getUser;
type KindeUser =  Awaited<ReturnType<UserType> >;

export default KindeUser;