# DriveRev Frontend - Next.js Dockerfile
FROM node:22-alpine

# 作業ディレクトリを設定
WORKDIR /app

# システムの依存関係をインストール
RUN apk add --no-cache libc6-compat curl

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションコードをコピー
COPY . .

# ポート3000を露出
EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# アプリケーション実行
CMD ["npm", "run", "dev"]
