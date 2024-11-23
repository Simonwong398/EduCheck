import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from './ErrorMessage';

function SocialInteraction() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [learningBuddies, setLearningBuddies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        const [friendsResponse, requestsResponse, buddiesResponse] = await Promise.all([
          axios.get('/social/friends'),
          axios.get('/social/friend-requests'),
          axios.get('/social/learning-buddies')
        ]);

        setFriends(friendsResponse.data);
        setFriendRequests(requestsResponse.data);
        setLearningBuddies(buddiesResponse.data);
      } catch (err) {
        setError('社交数据加载失败');
      }
    };

    fetchSocialData();
  }, []);

  const handleSearchUsers = async () => {
    try {
      const response = await axios.get(`/social/search?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (err) {
      setError('用户搜索失败');
    }
  };

  const sendFriendRequest = async (targetUserId) => {
    try {
      await axios.post('/social/friend-request', { targetUserId });
      alert('好友请求已发送');
    } catch (err) {
      setError('发送好友请求失败');
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      await axios.post('/social/accept-friend-request', { requestId });
      // 更新好友列表和请求列表
      const updatedRequests = friendRequests.filter(req => req._id !== requestId);
      setFriendRequests(updatedRequests);
    } catch (err) {
      setError('接受好友请求失败');
    }
  };

  const createLearningGroup = async () => {
    try {
      const response = await axios.post('/social/learning-group', {
        name: '学习小组',
        members: [], // 可以在这里添加初始成员
        subject: '通用'
      });
      alert('学习小组创建成功');
    } catch (err) {
      setError('创建学习小组失败');
    }
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <h2>社交学习</h2>

      {/* 用户搜索 */}
      <div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索用户"
        />
        <button onClick={handleSearchUsers}>搜索</button>
        {searchResults.map(user => (
          <div key={user._id}>
            {user.username}
            <button onClick={() => sendFriendRequest(user._id)}>
              发送好友请求
            </button>
          </div>
        ))}
      </div>

      {/* 好友请求 */}
      <div>
        <h3>好友请求</h3>
        {friendRequests.map(request => (
          <div key={request._id}>
            {request.sender.username}
            <button onClick={() => acceptFriendRequest(request._id)}>
              接受
            </button>
          </div>
        ))}
      </div>

      {/* 好友列表 */}
      <div>
        <h3>我的好友</h3>
        {friends.map(friend => (
          <div key={friend._id}>
            {friend.username}
            <span>学习进度: {friend.learningProgress}%</span>
          </div>
        ))}
      </div>

      {/* 学习伙伴 */}
      <div>
        <h3>学习伙伴</h3>
        {learningBuddies.map(buddy => (
          <div key={buddy._id}>
            {buddy.username}
            <span>共同学习科目: {buddy.commonSubjects.join(', ')}</span>
          </div>
        ))}
      </div>

      {/* 创建学习小组 */}
      <div>
        <button onClick={createLearningGroup}>
          创建学习小组
        </button>
      </div>
    </div>
  );
}

export default SocialInteraction;
