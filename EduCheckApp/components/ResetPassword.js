import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await resetPassword(email);
      setMessage(response.message || '密码重置链接已发送');
      
      // 3秒后跳转到登录页
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || '密码重置失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>重置密码</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="请输入注册邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '发送中...' : '发送重置链接'}
        </button>
      </form>

      <div>
        <Link to="/login">返回登录</Link>
        <Link to="/register">注册新账号</Link>
      </div>
    </div>
  );
}

export default ResetPassword;
