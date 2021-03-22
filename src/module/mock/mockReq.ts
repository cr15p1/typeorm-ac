import { Request } from 'express';
const mockReq = (override?: Partial<Request>): Request =>
  ({
    ...override,
  } as any);

export default mockReq;
