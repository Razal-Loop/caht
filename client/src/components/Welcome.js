import React, { useState } from 'react';
import { MessageCircle, Users, Shield, Zap } from 'lucide-react';

const Welcome = ({ onJoinAsGuest }) => {
  // Component updated - connection status removed
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState([]);
  const [interests, setInterests] = useState([]);

  const generateRandomAvatar = () => {
    const avatars = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=happy',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=joy',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=fun',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=chat',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anon',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    setAvatar(randomAvatar);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && avatar && gender) {
      onJoinAsGuest(username.trim(), avatar, gender, lookingFor, interests);
    }
  };

  const handleRandomJoin = () => {
    const randomUsername = `Guest_${Math.random().toString(36).substr(2, 9)}`;
    setUsername(randomUsername);
    generateRandomAvatar();
  };

  return (
    <div className="welcome-container">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="welcome-card">
              <div className="welcome-icon">
                <MessageCircle size={60} color="#25D366" />
              </div>
              
              <h1 className="welcome-title">AnonChat</h1>
              <p className="welcome-subtitle">
                Connect with strangers around the world. Chat anonymously and make new friends!
              </p>

        <div className="features">
          <div className="feature">
            <Shield size={20} color="#25D366" />
            <span>100% Anonymous</span>
          </div>
          <div className="feature">
            <Users size={20} color="#25D366" />
            <span>Smart Matching</span>
          </div>
          <div className="feature">
            <Zap size={20} color="#25D366" />
            <span>Real-time Chat</span>
          </div>
        </div>

              <form onSubmit={handleSubmit} className="join-form">
                <div className="mb-3">
                  <label className="form-label">Choose a username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username..."
                    maxLength={20}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Choose an avatar</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="Avatar URL (optional)"
                    />
                    <button
                      type="button"
                      onClick={generateRandomAvatar}
                      className="btn btn-outline-secondary"
                    >
                      🎲 Random
                    </button>
                  </div>
                  {avatar && (
                    <img src={avatar} alt="Avatar preview" className="avatar-preview mt-2" />
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Your Gender</label>
                  <select
                    className="form-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Looking to chat with</label>
                  <div className="row">
                    {['male', 'female', 'other'].map((option) => (
                      <div key={option} className="col-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`looking-${option}`}
                            checked={lookingFor.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setLookingFor([...lookingFor, option]);
                              } else {
                                setLookingFor(lookingFor.filter(g => g !== option));
                              }
                            }}
                          />
                          <label className="form-check-label capitalize" htmlFor={`looking-${option}`}>
                            {option}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Your Interests (select all that apply)</label>
                  <div className="row">
                    {[
                      'Gaming', 'Music', 'Movies', 'Sports', 'Travel', 'Food', 
                      'Art', 'Technology', 'Books', 'Fitness', 'Photography', 
                      'Fashion', 'Nature', 'Cooking', 'Dancing', 'Writing'
                    ].map((interest) => (
                      <div key={interest} className="col-6 col-md-4 col-lg-3 mb-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`interest-${interest}`}
                            checked={interests.includes(interest)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInterests([...interests, interest]);
                              } else {
                                setInterests(interests.filter(i => i !== interest));
                              }
                            }}
                          />
                          <label className="form-check-label" htmlFor={`interest-${interest}`}>
                            {interest}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-success btn-lg"
                    disabled={!username.trim() || !gender || lookingFor.length === 0}
                  >
                    Start Chatting
                  </button>

                  <button
                    type="button"
                    onClick={handleRandomJoin}
                    className="btn btn-outline-primary"
                  >
                    Join with Random Name & Avatar
                  </button>
                </div>

              </form>

              <div className="disclaimer text-center mt-3">
                <p className="text-muted">⚠️ This is an anonymous chat. Be respectful and have fun!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

