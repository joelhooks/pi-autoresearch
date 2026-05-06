import { spawn } from "node:child_process";

export interface ShellResult { code: number | null; signal: NodeJS.Signals | null; stdout: string; stderr: string; timedOut: boolean; }

export function runShell(command: string, timeoutSeconds: number): Promise<ShellResult> {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, stdio: ["ignore", "pipe", "pipe"], env: process.env });
    let stdout = "";
    let stderr = "";
    let done = false;
    const timer = setTimeout(() => {
      done = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 2000).unref();
      resolve({ code: null, signal: "SIGTERM", stdout, stderr, timedOut: true });
    }, timeoutSeconds * 1000);
    child.stdout.on("data", d => { stdout += d.toString(); process.stdout.write(d); });
    child.stderr.on("data", d => { stderr += d.toString(); process.stderr.write(d); });
    child.on("close", (code, signal) => {
      if (done) return;
      clearTimeout(timer);
      resolve({ code, signal, stdout, stderr, timedOut: false });
    });
  });
}
