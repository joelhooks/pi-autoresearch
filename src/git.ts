import { execFileSync } from "node:child_process";

export function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}
export function currentCommit(): string { return git(["rev-parse", "HEAD"]); }
export function diff(): string { return git(["diff", "--", ":! .pi-autoresearch"]); }
export function hasChanges(paths: string[]): boolean {
  const out = git(["status", "--porcelain", "--", ...paths]);
  return out.length > 0;
}
export function checkout(paths: string[]) { if (paths.length) git(["checkout", "--", ...paths]); }
export function add(paths: string[]) { if (paths.length) git(["add", ...paths]); }
export function commit(message: string): string {
  git(["commit", "-m", message]);
  return currentCommit();
}
