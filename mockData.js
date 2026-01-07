/**
 * モックデータ / Mock Data
 * テスト時に返すダミーデータ / Dummy data to return during testing
 */

const mockData = {
  // WebDB API モックレスポンス
  webdb: {
    '/api/products': {
      status: 200,
      data: {
        products: [
          {
            id: 'PROD001',
            name: 'テスト商品1',
            price: 1000,
            stock: 50
          },
          {
            id: 'PROD002',
            name: 'テスト商品2',
            price: 2000,
            stock: 30
          }
        ],
        total: 2
      }
    },
    '/api/customers': {
      status: 200,
      data: {
        customers: [
          {
            id: 'CUST001',
            name: '山田太郎',
            email: 'yamada@example.com'
          }
        ],
        total: 1
      }
    }
  },

  // SFCC API モックレスポンス
  sfcc: {
    '/api/sessions': {
      status: 200,
      data: {
        sessionId: 'mock-session-12345',
        token: 'mock-token-abcde',
        expiresIn: 3600
      }
    },
    '/api/orders': {
      status: 200,
      data: {
        orders: [
          {
            orderId: 'ORD001',
            customerId: 'CUST001',
            total: 3000,
            status: 'completed'
          }
        ],
        total: 1
      }
    }
  },

  // 郵便番号API モックレスポンス
  postalCode: {
    '/api/search': {
      status: 200,
      data: {
        message: null,
        results: [
          {
            address1: '東京都',
            address2: '千代田区',
            address3: '丸の内',
            kana1: 'トウキョウト',
            kana2: 'チヨダク',
            kana3: 'マルノウチ',
            prefcode: '13',
            zipcode: '1000005'
          }
        ],
        status: 200
      }
    }
  }
};

/**
 * モックレスポンスを取得
 * @param {string} apiType - API種別 (webdb, sfcc, postalCode)
 * @param {string} path - リクエストパス
 * @returns {Object} モックレスポンス
 */
function getMockResponse(apiType, path) {
  const apiMocks = mockData[apiType];
  if (!apiMocks) {
    return {
      status: 404,
      data: { error: 'API type not found' }
    };
  }

  // パスの完全一致を試みる
  if (apiMocks[path]) {
    return apiMocks[path];
  }

  // パスの部分一致を試みる
  for (const mockPath in apiMocks) {
    if (path.startsWith(mockPath)) {
      return apiMocks[mockPath];
    }
  }

  // デフォルトレスポンス
  return {
    status: 200,
    data: { message: 'Mock response', path, apiType }
  };
}

module.exports = {
  mockData,
  getMockResponse
};
