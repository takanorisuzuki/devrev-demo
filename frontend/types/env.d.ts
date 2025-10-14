/**
 * Environment Variables Type Definitions
 *
 * Next.jsアプリケーションで使用する環境変数の型定義
 */
declare namespace NodeJS {
  interface ProcessEnv {
    // バックエンドAPI
    NEXT_PUBLIC_API_URL: string;

    // DevRev PLuG SDK
    NEXT_PUBLIC_DEVREV_PLUG_SDK_URL?: string;

    // その他の環境変数
    NODE_ENV: "development" | "production" | "test";
  }
}
