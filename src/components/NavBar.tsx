import React from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { Logo } from "./Logo";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import UserAccountNav from "./UserAccountNav";
import MobileNav from "./MobileNav";

const NavBar = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <div className="flex justify-center items-center">
              <Logo />
              <span>ReaderPal</span>
            </div>
          </Link>

          <MobileNav user={user} />

          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  pricing
                </Link>
                <LoginLink
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  Sign in
                </LoginLink>
                <RegisterLink
                  className={buttonVariants({
                    size: "sm",
                    className: "bg-black text-white hover:bg-slate-600",
                  })}
                >
                  Get started
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  pricing
                </Link>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  Dashboard
                </Link>
                <UserAccountNav
                  email={user.email}
                  imageUrl={user.picture}
                  name={
                    !user.given_name || !user.family_name
                      ? `Your Account`
                      : `${user.given_name} ${user.family_name}`
                  }
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default NavBar;
