const k6 = require('k6');
const http = require('k6/http');
const { check, sleep } = k6;

// 性能测试配置
export const options = {
  // 虚拟用户配置
  vus: 100,  // 并发用户数
  duration: '5m',  // 测试持续时间

  // 性能阈值
  thresholds: {
    // HTTP响应时间
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    
    // 成功率
    'http_req_failed': ['rate<0.01'],
    
    // 每秒请求数
    'http_reqs': ['rate>100'],
  },

  // 阶段性负载测试
  stages: [
    { duration: '1m', target: 50 },   // 预热阶段
    { duration: '3m', target: 100 },  // 稳定负载
    { duration: '1m', target: 0 }     // 逐步降低负载
  ]
};

// 测试场景：用户注册
export default function() {
  const baseUrl = 'http://localhost:3000/api';
  
  // 用户注册场景
  const registrationPayload = JSON.stringify({
    username: `user_${__ITER}`,
    email: `user_${__ITER}@educheck.com`,
    password: 'TestPassword123!'
  });

  const registrationParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const registrationResponse = http.post(`${baseUrl}/auth/register`, registrationPayload, registrationParams);
  
  // 性能检查点
  check(registrationResponse, {
    '注册状态码为201': (r) => r.status === 201,
    '注册响应时间<500ms': (r) => r.timings.duration < 500,
  });

  // 课程推荐场景
  const token = registrationResponse.json().token;
  const recommendationParams = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const recommendationResponse = http.get(`${baseUrl}/recommendations/courses`, recommendationParams);
  
  check(recommendationResponse, {
    '推荐状态码为200': (r) => r.status === 200,
    '推荐课程数量>0': (r) => r.json().length > 0,
  });

  // 模拟真实用户思考时间
  sleep(1);
}

// 高级性能指标收集
export function handleSummary(data) {
  return {
    'performance-report.json': JSON.stringify(data),
    'performance-summary.txt': generateHumanReadableSummary(data)
  };
}

function generateHumanReadableSummary(data) {
  const { metrics } = data;
  return `
性能测试报告 - EduCheck平台

总体指标:
- 并发用户数: ${metrics.vus.value}
- 测试持续时间: 5分钟
- HTTP请求总数: ${metrics.http_reqs.count}
- 请求成功率: ${(1 - metrics.http_req_failed.rate) * 100}%

响应时间统计:
- 95%请求响应时间: ${metrics['http_req_duration{percentile:95}'].value}ms
- 99%请求响应时间: ${metrics['http_req_duration{percentile:99}'].value}ms

系统健康状况:
- 最大内存使用: ${metrics.memory_max.value / 1024 / 1024}MB
- CPU平均负载: ${metrics.cpu_avg.value}%

建议:
${generatePerformanceRecommendations(metrics)}
  `;
}

function generatePerformanceRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics['http_req_duration{percentile:95}'].value > 500) {
    recommendations.push('- 优化数据库查询性能');
  }

  if (metrics.memory_max.value > 1024 * 1024 * 1024) {
    recommendations.push('- 考虑增加服务器内存');
  }

  return recommendations.length > 0 
    ? recommendations.join('\n') 
    : '- 系统性能良好，无需特殊优化';
}
