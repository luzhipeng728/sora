import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useUserStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const from = (location.state as any)?.from?.pathname || '/videos/create';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">欢迎回来</h1>
          <p className="auth-subtitle">登录继续使用 Sora 视频生成</p>

          {error && (
            <div className="error-message">
              {error === 'Invalid credentials' ? '邮箱或密码错误' :
               error === 'User not found' ? '用户不存在' :
               error === 'Network Error' ? '网络连接失败，请检查后端服务' :
               error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              还没有账号？{' '}
              <Link to="/register" className="auth-link">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
