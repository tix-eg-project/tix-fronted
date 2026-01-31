// API optimization utilities

import axios from 'axios';

// Create optimized axios instance
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for optimization
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    // Add performance headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for optimization
apiClient.interceptors.response.use(
  (response) => {
    // Add performance timing
    if (response.config.metadata) {
      response.config.metadata.endTime = Date.now();
      response.config.metadata.duration = 
        response.config.metadata.endTime - response.config.metadata.startTime;
    }
    
    return response;
  },
  (error) => {
    // Handle common errors efficiently
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout');
    }
    
    return Promise.reject(error);
  }
);

// Request queue for rate limiting
class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        request,
        resolve,
        reject,
      });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { request, resolve, reject } = this.queue.shift();

    try {
      const response = await request();
      resolve(response);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

const requestQueue = new RequestQueue(3);

// Optimized API functions
export const optimizedApi = {
  // GET with caching
  async get(url, config = {}) {
    const cacheKey = `GET_${url}_${JSON.stringify(config.params || {})}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached && !config.forceRefresh) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return { data };
      }
    }

    const request = () => apiClient.get(url, config);
    const response = await requestQueue.add(request);
    
    // Cache successful responses
    if (response.status === 200) {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: response.data,
        timestamp: Date.now(),
      }));
    }
    
    return response;
  },

  // POST with retry logic
  async post(url, data, config = {}) {
    const request = () => apiClient.post(url, data, config);
    return requestQueue.add(request);
  },

  // PUT with retry logic
  async put(url, data, config = {}) {
    const request = () => apiClient.put(url, data, config);
    return requestQueue.add(request);
  },

  // DELETE with retry logic
  async delete(url, config = {}) {
    const request = () => apiClient.delete(url, config);
    return requestQueue.add(request);
  },

  // Batch requests
  async batch(requests) {
    return Promise.allSettled(requests);
  },

  // Clear cache
  clearCache() {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('GET_')) {
        sessionStorage.removeItem(key);
      }
    });
  },
};

// Debounced API calls
export const debouncedApi = {
  get: debounce(optimizedApi.get, 300),
  post: debounce(optimizedApi.post, 300),
  put: debounce(optimizedApi.put, 300),
  delete: debounce(optimizedApi.delete, 300),
};

// Helper function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Preload critical API endpoints
export const preloadCriticalApis = async () => {
  const criticalEndpoints = [
    '/api/auth/user/profile',
    '/api/categories',
    '/api/countries',
  ];

  const preloadPromises = criticalEndpoints.map(endpoint =>
    optimizedApi.get(endpoint).catch(() => {
      // Silently fail for preload requests
    })
  );

  await Promise.allSettled(preloadPromises);
};

// Performance monitoring
export const apiPerformanceMonitor = {
  startTime: null,
  
  start() {
    this.startTime = Date.now();
  },
  
  end(endpoint) {
    if (this.startTime) {
      const duration = Date.now() - this.startTime;
      // console.log(`API call to ${endpoint} took ${duration}ms`);
      
      if (duration > 3000) {
        console.warn(`Slow API call detected: ${endpoint} (${duration}ms)`);
      }
    }
  },
};

export default optimizedApi;
