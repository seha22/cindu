process.loadEnvFile?.(".env");
process.loadEnvFile?.(".env.local");
process.env.NODE_ENV ||= "production";
require("../dist/index.cjs");
