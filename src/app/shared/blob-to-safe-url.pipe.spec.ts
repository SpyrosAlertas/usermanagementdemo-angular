import { BlobToSafeUrlPipe } from './blob-to-safe-url.pipe';

describe('BlobToSafeUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new BlobToSafeUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
