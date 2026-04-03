try { process.loadEnvFile?.(".env"); } catch (e) {}
try { process.loadEnvFile?.(".env.local"); } catch (e) {}
process.env.NODE_ENV ||= "production";
require("../dist/index.cjs");
