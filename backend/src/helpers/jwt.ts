import jwt from "jsonwebtoken";

export function signToken(payload: object) {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set");
    process.exit(1);
  }

  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
}

export function verifyToken(token: string) {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set");
    process.exit(1);
  }

  return jwt.verify(token, process.env.JWT_SECRET!);
}
