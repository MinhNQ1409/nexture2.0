import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@nexture/core', '@nexture/db', '@nexture/contracts'],
  serverExternalPackages: ['pg'],
};
export default config;
