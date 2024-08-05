"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';  // Corrected import
import { signIn } from "next-auth/react";
import { toast } from "sonner";

function Page() {  // Renamed from 'page' to 'Page'
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [orgName, setOrgName] = useState("");
    const [orgId, setOrgId] = useState("");
    const [password, setPassword] = useState("");

    const toggleSignUp = () => {
        setIsSignUp(!isSignUp);
    };

    const handleAuth = async () => {
        const data = {
            orgId: orgId,
            orgName: orgName,
            password: password,
        };

        console.log("🚀 ~ file: Page.tsx:31 ~ handleAuth ~ data:", data);

        if (isSignUp) {
            try {
                const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + 'org/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                if (!response.ok) {
                    throw new Error('Failed to Sign Up');
                }
                const result = await response.json();
                console.log('Form submitted successfully', result);
                toast.success('Sign up successful');
                setIsSignUp(!isSignUp);
            } catch (error) {
                console.error('Error submitting form', error);
                toast.error('Error signing up');
            }
        } else {
            const res = await signIn('credentials', {...data, redirect: false});
            if (res?.error) {
                console.error('Error signing in', res.error);
                toast.error('Error signing in');
                return;
            }
            router.push('/dashboard');
            console.log('Form submitted successfully', res);
            toast.success('Sign in successful');
        }
    };

    return (
        <div className="main flex flex-col md:flex-row h-screen w-screen rounded-[16px]">
            <div className="section flex flex-col md:flex-row p-4 md:p-[40px] w-full md:w-screen">
                <div className="left p-4 md:p-[40px] bg-[#18181b] dark:bg-[#fafafa] dark:text-[#18181b] text-[#efefef] flex-[0.5] h-full flex flex-col justify-between rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                    <div className="leftTop flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 h-6 w-6"
                        >
                            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
                        </svg>
                        <h2>SpeakUp Inc</h2>
                    </div>
                    <div className="leftBottom mt-4">
                        <p>
                            We are a team of experts dedicated to helping organizations
                            solve their problems.
                        </p>
                    </div>
                </div>
                <div className="right relative p-4 md:p-[40px] w-full border-slate-50 border-2 flex-[0.5] h-full rounded-b-lg md:rounded-r-lg md:rounded-bl-none flex flex-col items-center justify-center">
                    <div>
                        <div
                            className="top absolute top-4 right-4 md:top-10 md:right-10 dark:text-[#efefef] text-[#09090b99] hover:text-[#000000] cursor-pointer"
                            onClick={toggleSignUp}
                        >
                            {isSignUp ? "Login" : "Sign Up"}
                        </div>
                    </div>
                    <div className="center flex flex-col items-center justify-center gap-4">
                        <div className="label text-[20px] md:text-[24px] font-bold">
                            {isSignUp ? "Create an account" : "Sign in to your organization"}
                        </div>
                        <div className="item w-full md:w-[352px] h-[36px] mt-[4px]">
                            <Input
                                type="text"
                                placeholder="Organization ID"
                                onChange={(e) => setOrgId(e.target.value)}
                            />
                        </div>
                        {isSignUp && (
                            <div className="item w-full md:w-[352px] h-[36px] mt-[4px]">
                                <Input
                                    type="text"
                                    placeholder="Organization Name"
                                    onChange={(e) => setOrgName(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="item w-full md:w-[352px] h-[36px]">
                            <Input
                                type="password"
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="item w-full md:w-[352px] h-[36px] mt-[8px]">
                            <Button onClick={handleAuth} className="w-full">
                                {isSignUp ? "Sign Up" : "Login"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
