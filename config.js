/**
 * プロキシサーバー設定
 * Proxy Server Configuration
 */

// 環境変数の読み込み
require('dotenv').config();

module.exports = {
  // サーバーポート / Server port
  port: process.env.PORT || 3000,

  // モックモード（テスト用ダミーデータを返す）/ Mock mode (return dummy data for testing)
  mockMode: process.env.MOCK_MODE === 'true',

  // 外部API設定 / External API configuration
  apis: {
    // WebDB API
    webdb: {
      targetUrl: process.env.WEBDB_API_URL || 'https://api.webdb.example.com',
      path: '/webdb',
      timeout: 30000
    },

    // SFCC (Salesforce Commerce Cloud) API
    sfcc: {
      targetUrl: process.env.SFCC_API_URL || 'https://api.sfcc.example.com',
      path: '/sfcc',
      timeout: 30000
    },

    // 郵便番号検索API / Postal code search API
    postalCode: {
      targetUrl: process.env.POSTAL_CODE_API_URL || 'https://zipcloud.ibsnet.co.jp',
      path: '/postal',
      timeout: 10000
    }
  },

  // IPアドレス固定設定 / Fixed IP address configuration
  // プロキシサーバーが特定のネットワークインターフェースを使用することで
  // 外部へのリクエストのIPアドレスを固定できます
  // By using a specific network interface, the proxy server can fix the IP address
  // for outgoing requests
  networkInterface: process.env.NETWORK_INTERFACE || undefined,

  // CORS設定 / CORS configuration
  cors: {
    enabled: true,
    origin: process.env.CORS_ORIGIN || '*'
  }
};
