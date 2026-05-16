const fs = require('fs');
let content = fs.readFileSync('apps/api/src/auth/auth.controller.spec.ts', 'utf8');

// Replace clearCookie with cookie in the mock setup
content = content.replace(
  'const res = { clearCookie: jest.fn() } as unknown as Response;',
  'const res = { cookie: jest.fn() } as unknown as Response;'
);

// Replace the expectation assertion
content = content.replace(
  'expect(res.clearCookie).toHaveBeenCalledWith("Authentication", {\n        path: "/",\n      });',
  'expect(res.cookie).toHaveBeenCalledWith("Authentication", "", expect.objectContaining({\n        path: "/"\n      }));'
);

fs.writeFileSync('apps/api/src/auth/auth.controller.spec.ts', content);
