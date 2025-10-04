import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useUserStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    // Client-side validation
    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username || undefined,
      });
      navigate('/videos/create', { replace: true });
    } catch (error) {
      // Error is handled by store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">创建账号</h1>
          <p className="auth-subtitle">注册开始生成视频</p>

          {(error || validationError) && (
            <div className="error-message">
              {validationError === 'Password must be at least 8 characters long' ? '密码至少需要 8 个字符' :
               validationError === 'Passwords do not match' ? '两次密码输入不一致' :
               error === 'Email already exists' ? '该邮箱已被注册' :
               error === 'Network Error' ? '网络连接失败，请检查后端服务' :
               validationError || error}
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
              <label htmlFor="username">用户名（可选）</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="显示名称"
                maxLength={50}
                autoComplete="username"
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
                placeholder="至少 8 个字符"
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="再次输入密码"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              已有账号？{' '}
              <Link to="/login" className="auth-link">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
