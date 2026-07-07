"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { landingFor } from "@/lib/nav";
import { Spinner } from "@/components/ui";

export default function Home() {
  const { ready, profile } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!profile) router.replace("/login");
    else router.replace(landingFor(profile.role));
  }, [ready, profile, router]);

  return <Spinner label="Loading…" />;
}
