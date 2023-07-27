"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useUser } from "@/src/contexts/AuthContext";

export default function RouteCheck({ children }) {
  const { user, loadingUser } = useUser();
  const { push } = useRouter();
  const path = usePathname();
  const params = useSearchParams();

  // TODO move routes to a config file
  const isProtected = useMemo(() => {
    const routes = {
      "/": { isProtected: true },
      "/login": { isProtected: false },
      "/signup": { isProtected: false },
      "/trackers": { isProtected: true },
      "/history": { isProtected: true },
    };
    return routes[path]?.isProtected ?? false;
  }, [path]);

  useEffect(() => {
    if (isProtected && !loadingUser && !user) {
      push("/login", { query: { redirect: path } });
    }
  }, [isProtected, loadingUser, path, push, user]);

  useEffect(() => {
    if (user && params.get("redirect")) {
      push(params.get("redirect"));
    }
    if (user && !loadingUser && (path === "/login" || path == "/signup")) {
      push("/");
    }
  }, [user, loadingUser, params, path, push]);

  if (!isProtected || (!loadingUser && user)) return <>{children}</>;

  return <div>Loading...</div>;
}
