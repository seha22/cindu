import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";

type ParsedArgs = {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
};

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {};
  const positional: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg.startsWith("--username=")) {
      parsed.username = arg.slice("--username=".length);
      continue;
    }

    if (arg.startsWith("--email=")) {
      parsed.email = arg.slice("--email=".length);
      continue;
    }

    if (arg.startsWith("--password=")) {
      parsed.password = arg.slice("--password=".length);
      continue;
    }

    if (arg.startsWith("--full-name=")) {
      parsed.fullName = arg.slice("--full-name=".length);
      continue;
    }

    if (arg === "--username") {
      parsed.username = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--email") {
      parsed.email = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--password") {
      parsed.password = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--full-name") {
      parsed.fullName = argv[index + 1];
      index += 1;
      continue;
    }

    if (!arg.startsWith("--")) {
      positional.push(arg);
    }
  }

  parsed.username ??= positional[0];
  parsed.email ??= positional[1];
  parsed.password ??= positional[2] ?? process.env.ADMIN_PASSWORD;
  parsed.fullName ??= positional[3];

  return parsed;
}

function printUsage() {
  console.log("Usage:");
  console.log("npm run admin:create -- admin admin@example.com \"strong-password\" \"Administrator\"");
  console.log("or");
  console.log("npm run admin:create -- --username admin --email admin@example.com --password \"strong-password\" --full-name \"Administrator\"");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const username = args.username;
  const email = args.email;
  const password = args.password;
  const fullName = args.fullName;

  if (!username || !email || !password || !fullName) {
    printUsage();
    process.exit(1);
  }

  const existingUsername = await storage.getUserByUsername(username);
  if (existingUsername) {
    throw new Error(`Username already exists: ${username}`);
  }

  const existingEmail = await storage.getUserByEmail(email);
  if (existingEmail) {
    throw new Error(`Email already exists: ${email}`);
  }

  const user = await storage.createUser({
    username,
    email,
    password: hashPassword(password),
    role: "admin",
    fullName,
    phone: null,
    address: null,
  });

  console.log(`Admin created with id ${user.id} and username ${user.username}`);
}

main().catch((error) => {
  console.error("Failed to create admin user.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
