# proxy-server
テスト環境用のプロキシサーバー

## 目的

このプロキシサーバーは、Houzin-ECのテスト環境で以下の目的のために使用されます：

1. **IPアドレスの固定**: 外部APIへ接続する際のIPアドレスを固定することで、API側のホワイトリスト設定を容易にします
2. **モックデータの提供**: 自動テスト時にダミーデータを返すことで、外部APIに依存しないテストを実現します

## 機能

- WebDB API へのプロキシ
- SFCC (Salesforce Commerce Cloud) API へのプロキシ
- 郵便番号検索API へのプロキシ
- モックモード（テスト用ダミーデータ返却）
- CORS対応
- ヘルスチェックエンドポイント

## セットアップ

### 必要要件

- Node.js 14.x 以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数ファイルの設定
cp .env.example .env
```

### 環境変数設定

`.env`ファイルを編集して、必要な設定を行います：

```env
# サーバーポート
PORT=3000

# モックモード（true: ダミーデータ, false: 実際のAPI）
MOCK_MODE=true

# 外部API URL
WEBDB_API_URL=https://api.webdb.example.com
SFCC_API_URL=https://api.sfcc.example.com
POSTAL_CODE_API_URL=https://zipcloud.ibsnet.co.jp

# CORS設定
CORS_ORIGIN=*
```

## 使用方法

### サーバーの起動

```bash
# 本番モード
npm start

# 開発モード
npm run dev
```

### エンドポイント

#### ヘルスチェック
```
GET http://localhost:3000/health
```

#### ルート情報
```
GET http://localhost:3000/
```

#### WebDB API
```
# プロキシ経由でWebDB APIにアクセス
GET/POST http://localhost:3000/webdb/api/products
GET/POST http://localhost:3000/webdb/api/customers
```

#### SFCC API
```
# プロキシ経由でSFCC APIにアクセス
GET/POST http://localhost:3000/sfcc/api/sessions
GET/POST http://localhost:3000/sfcc/api/orders
```

#### 郵便番号API
```
# プロキシ経由で郵便番号APIにアクセス
GET http://localhost:3000/postal/api/search?zipcode=1000005
```

## モックモード

`MOCK_MODE=true` を設定すると、実際の外部APIにアクセスせず、事前に定義されたダミーデータを返します。

### モックデータのカスタマイズ

`mockData.js` ファイルを編集して、モックデータをカスタマイズできます：

```javascript
const mockData = {
  webdb: {
    '/api/products': {
      status: 200,
      data: {
        // カスタムデータ
      }
    }
  }
};
```

## IPアドレスの固定

プロキシサーバーを特定のネットワークインターフェースにバインドすることで、外部APIへのリクエストのIPアドレスを固定できます。

環境変数 `NETWORK_INTERFACE` を設定してください：

```env
NETWORK_INTERFACE=eth0
```

## アーキテクチャ

```
クライアント
    ↓
プロキシサーバー (このサーバー)
    ↓
外部API (WebDB, SFCC, 郵便番号API)
```

### モックモード時

```
クライアント
    ↓
プロキシサーバー (モックデータを返す)
```

## トラブルシューティング

### ポートが既に使用されている

```bash
# ポートを変更
PORT=3001 npm start
```

### CORS エラー

`.env` ファイルで `CORS_ORIGIN` を適切に設定してください：

```env
CORS_ORIGIN=http://localhost:8080
```

## ライセンス

ISC

