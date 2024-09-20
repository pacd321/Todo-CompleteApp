"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const authSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

interface AuthFormProps {
  mode: "signin" | "signup";
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      authSchema.parse({ email, password });

      if (mode === "signin") {
        const res = await signIn("credentials", {
          email: email,
          password: password,
          redirect: false,
        });
        if (res?.error) {
          setError("Invalid email or password");
        } else if (res?.ok) {
          router.refresh();
          router.push("/todos");
        }
      } else {
        console.log("Signing up with:", email, password);
        router.push("/signin");
      }
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
      } else {
        setError("An unexpected error occurred");
        console.error(e);
      }
    }
  };

  const title = mode === "signin" ? "Sign In" : "Sign Up";
  const buttonText = mode === "signin" ? "Sign In" : "Sign Up";
  const footerText =
    mode === "signin" ? "Not a user? Sign Up" : "Already a user? Sign In";
  const footerLink = mode === "signin" ? "/signup" : "/signin";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>Enter your credentials to {title}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <Button className="w-full mt-8" type="submit">
              {buttonText}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Link href={footerLink} className="text-blue-400 text-destructive">
            {footerText}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
