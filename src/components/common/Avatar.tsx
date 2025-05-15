import React from 'react';
import styled from 'styled-components';
import { colors } from '@octobots/ui/src/styles';
import { modernColors, borderRadius } from '../../styles/theme';
import { getUserAvatar } from 'coreui/utils';
import { IUser } from '@octobots/ui/src/auth/types';
import { ICustomer } from '@octobots/ui-contacts/src/customers/types';

const AvatarWrapper = styled.div<{
  $size: number;
  $status?: 'online' | 'offline' | 'away';
  $isCustomer?: boolean;
}>`
  position: relative;
  width: ${props => `${props.$size}px`};
  height: ${props => `${props.$size}px`};
  border-radius: ${borderRadius.circle} !important;
  // overflow: hidden;
  flex-shrink: 0;
  background-color: ${modernColors.avatarBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: ${colors.colorWhite};
  font-size: ${props => `${Math.max(props.$size / 2.5, 10)}px`};
  
  &::after {
    content: '';
    display: ${props => (props.$status ? 'block' : 'none')};
    position: absolute;
    bottom: 0;
    inset-inline-end: 0;
    width: ${props => `${Math.max(props.$size / 4, 8)}px`};
    height: ${props => `${Math.max(props.$size / 4, 8)}px`};
    border-radius: 50%;
    background-color: ${props => 
      props.$status === 'online' 
        ? modernColors.success 
        : props.$status === 'away' 
          ? modernColors.warning 
          : colors.colorLightGray
    };
    border: 2px solid ${modernColors.contentBackground};
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${borderRadius.circle} !important;
`;

const AvatarInitials = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: ${props => props.color || modernColors.primary};
  color: white;
  font-weight: 600;
  border-radius: ${borderRadius.circle} !important;
`;

interface AvatarProps {
  user?: IUser;
  customer?: ICustomer;
  size?: number;
  status?: 'online' | 'offline' | 'away';
  src?: string;
  name?: string;
  color?: string;
}

const getInitials = (name: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getRandomColor = (name: string) => {
  const colors = [
    '#1F97FF', // primary
    '#f1b500', // secondary
    '#3CCC38', // success
    '#EA475D', // danger
    '#3B85F4', // info
    '#FDA50F', // warning
    '#63D2D6', // teal
    '#5629B6', // purple
  ];
  
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

const Avatar: React.FC<AvatarProps> = ({ 
  user, 
  customer, 
  size = 40, 
  status, 
  src, 
  name,
  color
}) => {
  let avatarSrc = src;
  let displayName = name || '';
  let isCustomer = false;
  
  if (user) {
    avatarSrc = getUserAvatar(user);
    displayName = user.details?.fullName || user.email || '';
  } else if (customer) {
    isCustomer = true;
    avatarSrc = customer.avatar || '';
    displayName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
  }
  
  const initials = getInitials(displayName);
  const avatarColor = color || getRandomColor(displayName);

  return (
    <AvatarWrapper $size={size} $status={status} $isCustomer={isCustomer}>
      {avatarSrc ? (
        <AvatarImage src={avatarSrc} alt={displayName} />
      ) : (
        <AvatarInitials color={avatarColor}>{initials}</AvatarInitials>
      )}
    </AvatarWrapper>
  );
};

export default Avatar;