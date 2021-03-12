export interface ServiceOpions {
  singleton?: boolean;
  key?: symbol;
}

export const Service = (
  { singleton, key }: ServiceOpions = { singleton: true },
): ClassDecorator => (target) => {
  if (singleton) {
    const instance = new (target as any)();
    if (key) Reflect.defineMetadata('service', instance, key);
    Reflect.defineMetadata('service', instance, target);
  }
};
