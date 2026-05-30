import { createApp } from './app';

describe('App Factory', () => {
  it('should create an Express application without throwing', () => {
    expect(() => createApp()).not.toThrow();
  });
});
