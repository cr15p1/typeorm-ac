interface ReqUser {
  id: string;
  role: string;
}
const mockReqUser = (override: Partial<ReqUser>): ReqUser => ({
  id: '',
  role: '',
  ...override,
});

export default mockReqUser;
