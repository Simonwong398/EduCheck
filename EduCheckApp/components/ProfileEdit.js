import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axiosConfig';
import ErrorMessage from './ErrorMessage';

function ProfileEdit() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    avatar: '',
    bio: '',
    interests: []
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [availableInterests] = useState([
    '数学', '编程', '科学', '历史', '文学', 
    '艺术', '音乐', '体育', '外语', '心理学'
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/user/profile');
        setProfile(response.data);
        setAvatarPreview(response.data.avatar);
      } catch (err) {
        setError('无法加载用户资料');
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setProfile(prev => ({
          ...prev,
          avatar: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInterestToggle = (interest) => {
    setProfile(prev => {
      const currentInterests = prev.interests || [];
      const newInterests = currentInterests.includes(interest)
        ? currentInterests.filter(i => i !== interest)
        : [...currentInterests, interest];
      
      return {
        ...prev,
        interests: newInterests
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      Object.keys(profile).forEach(key => {
        if (key === 'avatar' && profile[key] instanceof File) {
          formData.append(key, profile[key]);
        } else if (key !== 'avatar') {
          formData.append(key, JSON.stringify(profile[key]));
        }
      });

      const response = await axios.put('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('资料更新成功');
      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data?.message || '更新失败');
    }
  };

  return (
    <div>
      <h2>编辑个人资料</h2>
      
      {error && <ErrorMessage message={error} type="error" />}
      {success && <ErrorMessage message={success} type="success" />}

      <form onSubmit={handleSubmit}>
        <div>
          <label>头像</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarChange} 
          />
          {avatarPreview && (
            <img 
              src={avatarPreview} 
              alt="头像预览" 
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%' 
              }} 
            />
          )}
        </div>

        <div>
          <label>用户名</label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>邮箱</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>个人简介</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleInputChange}
            maxLength="200"
          />
        </div>

        <div>
          <label>兴趣领域</label>
          {availableInterests.map(interest => (
            <label key={interest}>
              <input
                type="checkbox"
                checked={(profile.interests || []).includes(interest)}
                onChange={() => handleInterestToggle(interest)}
              />
              {interest}
            </label>
          ))}
        </div>

        <button type="submit">保存资料</button>
      </form>
    </div>
  );
}

export default ProfileEdit;
