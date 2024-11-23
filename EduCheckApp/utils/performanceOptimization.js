import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorFallback from '../components/ErrorFallback';

// 性能优化工具集
export const PerformanceOptimizer = {
  // 懒加载组件
  lazyLoad: (importFn) => {
    return lazy(importFn);
  },

  // 防抖函数
  debounce: (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // 节流函数
  throttle: (func, limit = 200) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // 缓存高开销计算结果
  memoize: (fn) => {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  },

  // 性能安全的渲染包装器
  SafeRender: ({ children, fallback = <LoadingSpinner /> }) => (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  ),

  // 网络请求优化
  optimizedFetch: async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('请求超时');
      }
      throw error;
    }
  },

  // 本地存储缓存
  createPersistentCache: (key, initialValue = null) => {
    const get = () => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    };

    const set = (value) => {
      localStorage.setItem(key, JSON.stringify(value));
    };

    const remove = () => {
      localStorage.removeItem(key);
    };

    return { get, set, remove };
  }
};

export default PerformanceOptimizer;
