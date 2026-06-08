import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isPathMatch = (pathname: string, href: string): boolean => {
  const cleanPath = pathname.replace(/\/$/, "");
  const cleanHref = href.replace(/\/$/, "");

  if (cleanPath === cleanHref) return true;

  if (!cleanPath.startsWith(cleanHref)) return false;

  const pathParts = cleanPath.split("/");
  const menuParts = cleanHref.split("/");

  return pathParts.slice(0, menuParts.length).join("/") === cleanHref;
};

export const getRolePrefix = (role?: string) => {
  if (role === "super_admin") return "superadmin";
  if (role === "admin") return "admin";
  return "student"; // Default
};
