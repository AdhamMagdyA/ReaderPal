"use client";
import KindeUser from "@/types/User";
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { ArrowRight, Menu } from "lucide-react";
import Link from "next/link";
import React from "react";
import { buttonVariants } from "./ui/button";
import UserAccountNav from "./UserAccountNav";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";
import { Icons } from "./Icons";

interface props {
  user: KindeUser;
}

const MobileNav = ({ user }: props) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="sm:hidden ">
      <Menu
        onClick={toggleMenu}
        className="relative z-50 h-5 w-5 text-zinc-700 cursor-pointer"
      />

      {isOpen && (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
          <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {!user ? (
              <>
                <Link
                  href="/pricing"
                  onClick={() => setIsOpen(false)}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  pricing
                </Link>

                <li className="my-3 h-px w-full bg-gray-300" />
                <div className="flex justify-center">
                  <RegisterLink
                    onClick={() => setIsOpen(false)}
                    className={buttonVariants({
                      size: "sm",
                      className: "bg-black text-white hover:bg-slate-600 mx-2",
                    })}
                  >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />{" "}
                  </RegisterLink>

                  <LoginLink
                    onClick={() => setIsOpen(false)}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "mx-2",
                    })}
                  >
                    Sign in
                  </LoginLink>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <Avatar className="relative w-8 h-8">
                    {user.picture ? (
                      <div className="relative aspect-square h-full w-full">
                        <Image
                          fill
                          src={user.picture}
                          alt="profile picture"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <AvatarFallback>
                        <span className="sr-only">
                          {user.given_name} {user.family_name}
                        </span>
                        <Icons.user className="h-4 w-4 text-zinc-900" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="mx-5">
                    <div className="font-semibold">
                      {user.given_name} {user.family_name}
                    </div>
                    <div className="text-xs">{user.email}</div>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Dashboard
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setIsOpen(false)}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Plans
                </Link>
                <LogoutLink
                  onClick={() => setIsOpen(false)}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  Log out
                </LogoutLink>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
