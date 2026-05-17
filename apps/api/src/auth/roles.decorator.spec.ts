import { Roles, ROLES_KEY } from './roles.decorator';

describe('Roles Decorator', () => {
  it('should set roles metadata on a method', () => {
    class TestClass {
      @Roles('ADMIN', 'TRAINER')
      testMethod() {}
    }

    const testClass = new TestClass();
    const roles = Reflect.getMetadata(ROLES_KEY, testClass.testMethod);

    expect(roles).toEqual(['ADMIN', 'TRAINER']);
  });

  it('should set roles metadata on a class', () => {
    @Roles('ADMIN')
    class TestClass {}

    const roles = Reflect.getMetadata(ROLES_KEY, TestClass);
    expect(roles).toEqual(['ADMIN']);
  });
});
