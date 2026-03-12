import fs from "fs";
import path from "path";

const loadEnvFile = (process as NodeJS.Process & {
  loadEnvFile?: (path?: string) => void;
}).loadEnvFile;

for (const fileName of [".env", ".env.local"]) {
  const filePath = path.resolve(process.cwd(), fileName);
  if (fs.existsSync(filePath)) {
    loadEnvFile?.(filePath);
  }
}
