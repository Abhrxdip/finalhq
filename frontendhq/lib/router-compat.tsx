"use client";

import Link from "next/link";
import { useParams as useNextParams, usePathname, useRouter } from "next/navigation";
import React from "react";

type NavigateOptions = {
  replace?: boolean;
};

type ParamValue = string | string[] | undefined;

type NavLinkProps = React.PropsWithChildren<{
  to: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}>;

export function useNavigate() {
  const router = useRouter();

  return React.useCallback(
    (to: string, options?: NavigateOptions) => {
      if (options?.replace) {
        router.replace(to);
        return;
      }
      router.push(to);
    },
    [router]
  );
}

export function useLocation() {
  const pathname = usePathname() ?? "/";
  return React.useMemo(() => ({ pathname }), [pathname]);
}

export function useParams<T extends Record<string, ParamValue> = Record<string, ParamValue>>() {
  return useNextParams() as unknown as T;
}

export function NavLink({ to, children, className, style, onClick }: NavLinkProps) {
  return (
    <Link href={to} className={className} style={style} onClick={onClick}>
      {children}
    </Link>
  );
}
