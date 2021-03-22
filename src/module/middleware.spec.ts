/* eslint-disable jest/no-done-callback */
import { MikroORM } from '@mikro-orm/core';
import { RequestHandler, Response, Request } from 'express';
import mockReq from './mock/mockReq';
import mockReqUser from './mock/mockReqUser';
import mockRes from './mock/mockRes';

describe('middleware', () => {
  const spy = jest.spyOn(MikroORM, 'init');

  afterEach(() => {
    spy.mockReset();
  });

  describe('original mikro-orm init override', () => {
    beforeEach(async () => {
      spy.mockResolvedValue(null as any);
      await import('./middleware');
    });

    it('should call the original mikro-orm init function 1 times', async () => {
      await MikroORM.init();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should add the middleware entities to mikro-orm options', async () => {
      await MikroORM.init();

      expect(spy.mock.calls[0]).toMatchSnapshot();
    });

    it('should keep the given entities when the init function of mikro-orm is called', async () => {
      const entities = ['./foo.ts', './bar.ts'];
      await MikroORM.init({
        entities,
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          entities: expect.arrayContaining(entities),
        }),
        undefined,
      );
    });

    it('should keep the given entitiesTs when the init function of mikro-orm is called', async () => {
      const entitiesTs = ['./foo.ts', './bar.ts'];
      await MikroORM.init({
        entitiesTs,
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          entitiesTs: expect.arrayContaining(entitiesTs),
        }),
        undefined,
      );
    });

    it('should set the promised orm object to the metadata storage', async () => {
      spy.mockResolvedValue('foo' as any);
      const Metadata = await import('./metadata');
      const setOrm = jest.spyOn(Metadata, 'setOrm');

      await MikroORM.init();
      expect(setOrm).toHaveBeenCalledTimes(1);
      expect(setOrm).toHaveBeenLastCalledWith('foo');
    });
  });

  describe('scoped storage', () => {
    let res: Response;
    let req: Request;
    let handler: RequestHandler;
    let getAcRepositorySpy: jest.SpyInstance;
    let findSpy: jest.SpyInstance;
    const Middleware = import('./middleware');
    const Metadata = import('./metadata');

    beforeEach(async () => {
      const Metadata = await import('./metadata');
      findSpy = jest.fn();
      getAcRepositorySpy = jest
        .spyOn(Metadata, 'getAcRepository')
        .mockReturnValue({ find: findSpy } as any);
      req = mockReq({ user: { id: '', role: '' } } as any);
      res = mockRes();
      handler = await (await Middleware).middleware({
        entityOwner: '',
        userIdPath: 'req.user.id',
        userRolePath: 'req.user.role',
      });
    });

    it('should store the userId in the scoped storage', async () => {
      const nextRequest = mockReq({
        ...req,
        user: mockReqUser({ id: 'foo' }),
      } as any);
      await handler(nextRequest, res, async () => {
        const { getScopedStorage } = await Middleware;
        const storage = getScopedStorage();
        expect(storage.userId).toEqual('foo');
      });
    });

    it('should store the userRole in the scoped storage', async () => {
      const nextRequest = mockReq({
        ...req,
        user: mockReqUser({ role: 'foo' }),
      } as any);
      await handler(nextRequest, res, async () => {
        const { getScopedStorage } = await Middleware;
        const storage = getScopedStorage();
        expect(storage.userRole).toEqual('foo');
      });
    });

    it('should select all entity based roles by userId', async (done) => {
      const nextRequest = mockReq({
        ...req,
        user: mockReqUser({ id: 'foo' }),
      } as any);
      await handler(nextRequest, res, async () => {
        expect(findSpy).toHaveBeenCalledWith({
          userId: 'foo',
        });
        done();
      });
    });
  });
});
