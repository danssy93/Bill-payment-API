export type AccessTokenPayload = {
  accessToken: string;
  expiresIn: string;
};

export type RefreshTokenPayload = {
  refreshToken: string;
  expiresIn: string;
};

export interface IJwtDecodedToken {
  user_id: string;
  sub: number;
  user_type: string;
  identifier: string;
  wallet_id: string;
  iat: number;
  exp: number;
}
