import { Requester } from '@shared/interface';

declare global {
  namespace Express {
    interface Request {
      user?: Requester;
    }
  }
}
