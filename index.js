/**
 * テスト環境用プロキシサーバー
 * Proxy Server for Test Environment
 * 
 * 目的:
 * - 外部APIへ接続するためのIPアドレスを固定するため
 * - 自動テスト時などにダミーデータを返すようにするため
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const config = require('./config');
const { getMockResponse } = require('./mockData');

const app = express();

// JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS設定
if (config.cors.enabled) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.cors.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
}

// ロギングミドルウェア
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mockMode: config.mockMode,
    timestamp: new Date().toISOString()
  });
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({
    message: 'Proxy Server for Test Environment',
    version: '1.0.0',
    mockMode: config.mockMode,
    endpoints: {
      webdb: config.apis.webdb.path,
      sfcc: config.apis.sfcc.path,
      postalCode: config.apis.postalCode.path
    }
  });
});

/**
 * モックレスポンスハンドラー
 * @param {string} apiType - API種別
 */
function createMockHandler(apiType) {
  return (req, res) => {
    const path = req.path.replace(config.apis[apiType].path, '');
    const fullPath = path || '/';
    
    console.log(`[MOCK] ${apiType} ${fullPath}`);
    
    const mockResponse = getMockResponse(apiType, fullPath);
    res.status(mockResponse.status).json(mockResponse.data);
  };
}

/**
 * プロキシ設定を作成
 * @param {string} targetUrl - プロキシ先URL
 * @param {string} apiPath - APIパス
 */
function createProxyConfig(targetUrl, apiPath) {
  return {
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^${apiPath}`]: ''
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[PROXY] ${req.method} ${targetUrl}${req.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[PROXY RESPONSE] ${proxyRes.statusCode} ${req.path}`);
    },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${err.message}`);
      res.status(502).json({
        error: 'Proxy Error',
        message: err.message
      });
    }
  };
}

// WebDB API プロキシ
if (config.mockMode) {
  app.use(config.apis.webdb.path, createMockHandler('webdb'));
} else {
  app.use(
    config.apis.webdb.path,
    createProxyMiddleware(createProxyConfig(
      config.apis.webdb.targetUrl,
      config.apis.webdb.path
    ))
  );
}

// SFCC API プロキシ
if (config.mockMode) {
  app.use(config.apis.sfcc.path, createMockHandler('sfcc'));
} else {
  app.use(
    config.apis.sfcc.path,
    createProxyMiddleware(createProxyConfig(
      config.apis.sfcc.targetUrl,
      config.apis.sfcc.path
    ))
  );
}

// 郵便番号API プロキシ
if (config.mockMode) {
  app.use(config.apis.postalCode.path, createMockHandler('postalCode'));
} else {
  app.use(
    config.apis.postalCode.path,
    createProxyMiddleware(createProxyConfig(
      config.apis.postalCode.targetUrl,
      config.apis.postalCode.path
    ))
  );
}

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: 'The requested endpoint does not exist'
  });
});

// エラーハンドラー
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// サーバー起動
const server = app.listen(config.port, () => {
  console.log('='.repeat(50));
  console.log('Proxy Server for Test Environment');
  console.log('='.repeat(50));
  console.log(`Server running on port: ${config.port}`);
  console.log(`Mock mode: ${config.mockMode ? 'ENABLED' : 'DISABLED'}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
  console.log('\nAPI Endpoints:');
  console.log(`  - WebDB:       http://localhost:${config.port}${config.apis.webdb.path}`);
  console.log(`  - SFCC:        http://localhost:${config.port}${config.apis.sfcc.path}`);
  console.log(`  - Postal Code: http://localhost:${config.port}${config.apis.postalCode.path}`);
  console.log('='.repeat(50));
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
