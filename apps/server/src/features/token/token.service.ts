import jwt from "jsonwebtoken";

export default class TokenService {
  private jwtService: typeof jwt;
  private JWT_SECRET: string;
  private EXPIRES_IN: string | number;

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
}