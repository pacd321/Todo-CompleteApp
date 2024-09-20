import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Button } from "../ui/button";
import SignOutButton from "@/components/todo/signOutButton";
export default async function NavBar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-slate-600">Todoist</span>
            </Link>
          </div>
          <div className="flex items-center">
            {session ? (
              <div>
                <span className="text-gray-700 justify-between mr-8">
                  Welcome, {session.user?.email}
                </span>
                <SignOutButton />
              </div>
            ) : (
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
