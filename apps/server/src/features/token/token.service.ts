import jwt from "jsonwebtoken";

export default class TokenService {
  private jwtService: typeof jwt;
  private JWT_SECRET: string;
  private EXPIRES_IN: string | number;
  // simple in-memory blacklist: token -> expiry timestamp (ms)
  private revoked: Map<string, number> = new Map();

  constructor(jwtService: typeof jwt, jwtSecret: string, expiresIn: string | number) {
    this.jwtService = jwtService;
    this.JWT_SECRET = jwtSecret;
    this.EXPIRES_IN = expiresIn;
  }

  async generateToken(user: unknown): Promise<string> {
    const options = { expiresIn: this.EXPIRES_IN } as jwt.SignOptions;
    return this.jwtService.sign({ user }, this.JWT_SECRET as jwt.Secret, options);
  }

  async verifyToken(token: string): Promise<any | null> {
    try {
      return this.jwtService.verify(token, this.JWT_SECRET as jwt.Secret);
    } catch {
      return null;
    }
  }

  async revokeToken(token: string): Promise<void> {
    // attempt to decode token to get expiry
    try {
      const decoded: any = this.jwtService.decode(token) as any;
      const exp = decoded?.exp;
      if (!exp) {
        // no expiry — revoke for a default short window (1 hour)
        const ttl = Date.now() + 1000 * 60 * 60;
        this.revoked.set(token, ttl);
        return;
      }

      // exp is in seconds since epoch
      const expiryMs = exp * 1000;
      this.revoked.set(token, expiryMs);
    } catch {
      // if decode fails, still add token with short TTL
      const ttl = Date.now() + 1000 * 60 * 60;
      this.revoked.set(token, ttl);
    }
  }

  async isRevoked(token: string): Promise<boolean> {
    const expiry = this.revoked.get(token);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.revoked.delete(token);
      return false;
    }
    return true;
  }
}