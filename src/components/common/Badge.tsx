import React from 'react';
import styled from 'styled-components';
import { modernColors, borderRadius, typography } from '../../styles/theme';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'default';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  count?: number;
  max?: number;
  dot?: boolean;
  children?: React.ReactNode;
}

const BadgeContainer = styled.span<{
  $variant: BadgeVariant;
  $size: BadgeSize;
  $isDot: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${typography.fontWeights.medium};
  border-radius: ${props => props.$isDot ? borderRadius.circle : borderRadius.pill};
  
  ${props => {
    // Size styles
    const sizes = {
      sm: {
        fontSize: typography.fontSizes.xs,
        height: props.$isDot ? '8px' : '16px',
        minWidth: props.$isDot ? '8px' : '16px',
        padding: props.$isDot ? '0' : '0 4px',
      },
      md: {
        fontSize: typography.fontSizes.sm,
        height: props.$isDot ? '10px' : '20px',
        minWidth: props.$isDot ? '10px' : '20px',
        padding: props.$isDot ? '0' : '0 6px',
      },
      lg: {
        fontSize: typography.fontSizes.md,
        height: props.$isDot ? '12px' : '24px',
        minWidth: props.$isDot ? '12px' : '24px',
        padding: props.$isDot ? '0' : '0 8px',
      },
    };
    
    // Variant styles
    const variants = {
      primary: {
        backgroundColor: modernColors.primary,
        color: '#FFFFFF',
      },
      secondary: {
        backgroundColor: modernColors.secondary,
        color: '#FFFFFF',
      },
      success: {
        backgroundColor: modernColors.success,
        color: '#FFFFFF',
      },
      danger: {
        backgroundColor: modernColors.danger,
        color: '#FFFFFF',
      },
      warning: {
        backgroundColor: modernColors.warning,
        color: '#FFFFFF',
      },
      info: {
        backgroundColor: modernColors.info,
        color: '#FFFFFF',
      },
      default: {
        backgroundColor: modernColors.messageBackground,
        color: modernColors.textSecondary,
      },
    };
    
    return `
      font-size: ${sizes[props.$size].fontSize};
      height: ${sizes[props.$size].height};
      min-width: ${sizes[props.$size].minWidth};
      padding: ${sizes[props.$size].padding};
      background-color: ${variants[props.$variant].backgroundColor};
      color: ${variants[props.$variant].color};
      line-height: ${sizes[props.$size].height};
    `;
  }}
`;

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  count,
  max = 99,
  dot = false,
  children,
}) => {
  const displayCount = count !== undefined && count > max ? `${max}+` : count;
  
  return (
    <BadgeContainer $variant={variant} $size={size} $isDot={dot}>
      {dot ? null : displayCount !== undefined ? displayCount : children}
    </BadgeContainer>
  );
};

export default Badge;