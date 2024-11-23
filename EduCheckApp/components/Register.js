import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 前端验证
    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    try {
      const response = await axios.post('/register', { 
        username, 
        password 
      });
      
      setSuccess(response.data.message);
      setError('');
      
      // 清空表单
      setUsername('');
      setPassword('');
      setConfirmPassword('');

      // 可选：自动跳转到登录页面
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || '注册失败');
      setSuccess('');
    }
  };

  return (
    <div>
      <h2>用户注册</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength="3"
          maxLength="20"
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
        />
        <input
          type="password"
          placeholder="确认密码"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength="6"
        />
        <button type="submit">注册</button>
      </form>
    </div>
  );
}

export default Register;
