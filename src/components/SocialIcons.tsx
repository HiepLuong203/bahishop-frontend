import React from 'react';
import './SocialIcons.css';

interface FixedSocialIconsProps {
  phoneNumber: string;
  messengerLink?: string;
  zaloLink?: string;
}

const SocialIcons: React.FC<FixedSocialIconsProps> = ({ phoneNumber, messengerLink, zaloLink }) => {
  return (
    <div className="fixed-social-icons">
      {phoneNumber && (
        <div className="social-icon phone-container">
          <a href={`tel:${phoneNumber}`} className="phone-link">
            <span className="phone-number">{phoneNumber}</span>
          </a>
          <div className="phone-icon-wrapper">
            <img src="/iconphone.png" alt="Phone" className="social-image phone-icon" />
          </div>
        </div>
      )}
      {messengerLink && (
        <a href={messengerLink} target="_blank" rel="noopener noreferrer" className="social-icon messenger">
          <img src="/iconmess.png" alt="Messenger" className="social-image" />
        </a>
      )}
      {zaloLink && (
        <a href={zaloLink} target="_blank" rel="noopener noreferrer" className="social-icon zalo">
          <img src="/iconzalo.png" alt="Zalo" className="social-image" />
        </a>
      )}
    </div>
  );
};

export default SocialIcons;