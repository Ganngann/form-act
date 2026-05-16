const fs = require('fs');
const content = fs.readFileSync('apps/api/src/auth/auth.controller.spec.ts', 'utf8');
const updated = content
  .replace(
    'const res = { clearCookie: jest.fn() } as unknown as Response;',
    'const res = { cookie: jest.fn() } as unknown as Response;'
  )
  .replace(
    'expect(res.clearCookie).toHaveBeenCalledWith("Authentication", {\n        path: "/",\n      });',
    'expect(res.cookie).toHaveBeenCalledWith("Authentication", "", expect.objectContaining({\n        path: "/",\n      }));'
  );
fs.writeFileSync('apps/api/src/auth/auth.controller.spec.ts', updated);
