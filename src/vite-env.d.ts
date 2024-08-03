/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOL_CLUSTER: string;
  readonly VITE_RPC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
