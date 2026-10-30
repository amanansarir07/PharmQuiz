"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLoading } from "@/components/app-state";

function OpenGroupChat() {
  const router = useRouter();
  const params = useSearchParams();
  const question = params.get("question");
  useEffect(() => {
    router.replace(`/community${question ? `?question=${encodeURIComponent(question)}` : ""}`);
  }, [router, question]);
  return <AppLoading label="Opening your group chat" variant="questions" />;
}

export default function NewCommunityPostPage() {
  return <Suspense fallback={<AppLoading label="Opening your group chat" variant="questions" />}><OpenGroupChat /></Suspense>;
}
