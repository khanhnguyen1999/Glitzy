import { ITokenIntrospect, ITokenProvider, TokenIntrospectResult } from '@shared/interface';

/**
 * Adapter class to make ITokenProvider compatible with ITokenIntrospect
 * This allows using the jwtProvider with the authMiddleware
 */
export class JwtTokenIntrospectAdapter implements ITokenIntrospect {
  private tokenProvider: ITokenProvider;

  constructor(tokenProvider: ITokenProvider) {
    this.tokenProvider = tokenProvider;
  }

  async introspect(token: string): Promise<TokenIntrospectResult> {
    try {
      const payload = await this.tokenProvider.verifyToken(token);
      
      if (!payload) {
        return {
          payload: null,
          isOk: false,
          error: new Error('Invalid token')
        };
      }

      return {
        payload,
        isOk: true
      };
    } catch (error) {
      return {
        payload: null,
        isOk: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }
}
