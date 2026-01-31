// Performance optimization utilities

// Debounce function for input fields
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoized API calls
export const createMemoizedApiCall = (apiFunction) => {
  const cache = new Map();
  
  return async (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = await apiFunction(...args);
    cache.set(key, result);
    
    // Clear cache after 5 minutes
    setTimeout(() => cache.delete(key), 5 * 60 * 1000);
    
    return result;
  };
};

// Image lazy loading utility
export const lazyLoadImage = (img, src) => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  imageObserver.observe(img);
};

// Preload critical resources
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Bundle size analyzer
export const analyzeBundle = () => {
  if (process.env.NODE_ENV === 'development') {
    //console.log('Bundle size analysis available in development mode');
  }
};

// Memory usage monitor
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = performance.memory;
    //console.log({
    //   used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
    //   total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
    //   limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
    // });
  }
};
