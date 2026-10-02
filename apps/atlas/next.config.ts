import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@nexture/db', '@nexture/contracts'],
  serverExternalPackages: ['pg'],
};
export default config;
