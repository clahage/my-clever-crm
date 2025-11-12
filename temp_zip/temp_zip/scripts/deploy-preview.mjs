import { execSync } from "node:child_process";
const channel = "preview-auth";
execSync(`firebase hosting:channel:deploy ${channel} --project my-clever-crm`, { stdio: "inherit" });
