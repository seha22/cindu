import { randomBytes } from "crypto";
import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";

type ParsedArgs = {
  username?: string;
  email?: string;
  fullName?: string;
  password?: string;
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
    if (arg.startsWith("--full-name=")) {
      parsed.fullName = arg.slice("--full-name=".length);
      continue;
    }
    if (arg.startsWith("--password=")) {
      parsed.password = arg.slice("--password=".length);
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
    if (arg === "--full-name") {
      parsed.fullName = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--password") {
      parsed.password = argv[index + 1];
      index += 1;
      continue;
    }

    if (!arg.startsWith("--")) {
      positional.push(arg);
    }
  }

  parsed.username ??= positional[0] ?? process.env.ADMIN_USERNAME ?? "admin";
  parsed.email ??= positional[1] ?? process.env.ADMIN_EMAIL ?? "admin@cindu.com";
  parsed.fullName ??= positional[2] ?? process.env.ADMIN_FULL_NAME ?? "Production Administrator";
  parsed.password ??= positional[3] ?? process.env.ADMIN_PASSWORD;

  return parsed;
}

function generateStrongPassword() {
  // URL-safe 32-char token, suitable as initial credential.
  return randomBytes(24).toString("base64url");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const username = args.username;
  const email = args.email;
  const fullName = args.fullName;
  const password = args.password || generateStrongPassword();

  if (!username || !email || !fullName) {
    throw new Error("Missing username/email/fullName");
  }

  const emailOwner = await storage.getUserByEmail(email);
  const existing = await storage.getUserByUsername(username);

  if (emailOwner && (!existing || emailOwner.id !== existing.id)) {
    throw new Error(`Email already exists for another user: ${email}`);
  }

  if (existing) {
    await storage.updateUser(existing.id, {
      email,
      fullName,
      role: "admin",
      password: hashPassword(password),
    });

    console.log("action=updated");
    console.log(`username=${username}`);
    console.log(`email=${email}`);
    console.log(`password=${password}`);
    return;
  }

  await storage.createUser({
    username,
    email,
    fullName,
    role: "admin",
    password: hashPassword(password),
    phone: null,
    address: null,
  });

  console.log("action=created");
  console.log(`username=${username}`);
  console.log(`email=${email}`);
  console.log(`password=${password}`);
}

main().catch((error) => {
  console.error("Failed to bootstrap production admin.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
