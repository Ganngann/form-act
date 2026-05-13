import { sanitize } from './sanitize';

describe('sanitize', () => {
  it('allows safe HTML', () => {
    expect(sanitize('<p>Hello <b>world</b></p>')).toBe('<p>Hello <b>world</b></p>');
  });

  it('removes scripts', () => {
    expect(sanitize('<p>Hello <script>alert("xss")</script>world</p>')).toBe('<p>Hello world</p>');
  });

  it('preserves class names', () => {
    expect(sanitize('<div class="my-class">Content</div>')).toBe('<div class="my-class">Content</div>');
  });

  it('preserves specific tags', () => {
    expect(sanitize('<span class="text-primary">Text</span>')).toBe('<span class="text-primary">Text</span>');
  });
});
