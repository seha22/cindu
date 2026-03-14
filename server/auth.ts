import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { type Express } from "express";
import { storage } from "./storage";
import { compareSync, hashSync } from "bcryptjs";

export const SESSION_COOKIE_NAME = "cinta_dhuafa.sid";

function getTrustProxySetting() {
  const trustProxy = process.env.TRUST_PROXY?.trim();
  if (!trustProxy) {
    return process.env.NODE_ENV === "production" ? true : false;
  }

  if (trustProxy === "true") return true;
  if (trustProxy === "false") return false;

  const numericValue = Number(trustProxy);
  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  return trustProxy;
}

function isIpv4Host(hostname: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

export function getSessionCookieDomain() {
  const configuredDomain = process.env.SESSION_COOKIE_DOMAIN?.trim();
  if (!configuredDomain) {
    return undefined;
  }

  const normalizedDomain = configuredDomain.replace(/^\.+/, "").toLowerCase();
  if (!normalizedDomain || normalizedDomain === "localhost" || isIpv4Host(normalizedDomain)) {
    return undefined;
  }

  return `.${normalizedDomain}`;
}

function getSessionCookieOptions(isProduction: boolean): session.CookieOptions {
  return {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction ? "auto" : false,
    sameSite: "lax",
    domain: getSessionCookieDomain(),
    path: "/",
  };
}

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      role: string;
      fullName: string;
      phone: string | null;
      address: string | null;
      createdAt: Date | null;
    }
  }
}

export function hashPassword(password: string): string {
  return hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

export function setupAuth(app: Express) {
  const PgSession = connectPgSimple(session);
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET || "dev-session-secret-change-me";
  const trustProxy = getTrustProxySetting();

  if (isProduction && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set in production");
  }

  if (trustProxy !== false) {
    app.set("trust proxy", trustProxy);
  }

  const pgSessionStore = new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
    errorLog: (err: Error) => {
      console.error("[session-store] PgSession error:", err.message);
    },
  });

  app.use(
    session({
      name: SESSION_COOKIE_NAME,
      store: pgSessionStore,
      secret: sessionSecret,
      resave: true,
      saveUninitialized: false,
      rolling: true,
      proxy: isProduction,
      cookie: getSessionCookieOptions(isProduction),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Username tidak ditemukan" });
        }
        if (!comparePassword(password, user.password)) {
          return done(null, false, { message: "Password salah" });
        }
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword as Express.User);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      if (!user) {
        return done(null, false);
      }
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword as Express.User);
    } catch (err) {
      done(err);
    }
  });
}

export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}
