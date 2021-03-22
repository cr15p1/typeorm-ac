import { Response } from 'express';

const mockRes = (override?: Partial<Response>): Response =>
  ({
    ...override,
  } as Response);

export default mockRes;
