import React from 'react';
import styled from 'styled-components';
import { modernColors, borderRadius, typography, transitions } from '../../styles/theme';
import Icon from '@octobots/ui/src/components/Icon';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'default' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $hasIcon: boolean;
  $iconPosition: 'left' | 'right';
  $fullWidth: boolean;
  $isLoading: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${typography.fontFamily};
  font-weight: ${typography.fontWeights.medium};
  border-radius: ${borderRadius.md};
  transition: all ${transitions.fast};
  cursor: ${props => (props.$isLoading ? 'wait' : 'pointer')};
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  border: none;
  outline: none;
  position: relative;
  white-space: nowrap;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${props => {
    // Size styles
    const sizes = {
      sm: {
        fontSize: typography.fontSizes.sm,
        padding: '6px 12px',
        height: '32px',
      },
      md: {
        fontSize: typography.fontSizes.md,
        padding: '8px 16px',
        height: '40px',
      },
      lg: {
        fontSize: typography.fontSizes.lg,
        padding: '10px 20px',
        height: '48px',
      },
    };
    
    // Variant styles
    const variants = {
      primary: {
        backgroundColor: modernColors.primary,
        color: '#FFFFFF',
        hoverBg: '#1a85e0',
        activeBg: '#1676c7',
      },
      secondary: {
        backgroundColor: modernColors.secondary,
        color: '#FFFFFF',
        hoverBg: '#d9a300',
        activeBg: '#c29200',
      },
      success: {
        backgroundColor: modernColors.success,
        color: '#FFFFFF',
        hoverBg: '#35b632',
        activeBg: '#2fa12c',
      },
      danger: {
        backgroundColor: modernColors.danger,
        color: '#FFFFFF',
        hoverBg: '#d33f53',
        activeBg: '#bc384a',
      },
      warning: {
        backgroundColor: modernColors.warning,
        color: '#FFFFFF',
        hoverBg: '#e3940e',
        activeBg: '#ca840c',
      },
      info: {
        backgroundColor: modernColors.info,
        color: '#FFFFFF',
        hoverBg: '#3577db',
        activeBg: '#2f69c2',
      },
      default: {
        backgroundColor: modernColors.messageBackground,
        color: modernColors.textPrimary,
        hoverBg: '#e5e7eb',
        activeBg: '#d1d5db',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: modernColors.textPrimary,
        hoverBg: 'rgba(0, 0, 0, 0.05)',
        activeBg: 'rgba(0, 0, 0, 0.1)',
      },
    };
    
    return `
      font-size: ${sizes[props.$size].fontSize};
      padding: ${sizes[props.$size].padding};
      height: ${sizes[props.$size].height};
      background-color: ${variants[props.$variant].backgroundColor};
      color: ${variants[props.$variant].color};
      
      &:hover:not(:disabled) {
        background-color: ${variants[props.$variant].hoverBg};
      }
      
      &:active:not(:disabled) {
        background-color: ${variants[props.$variant].activeBg};
      }
      
      ${props.$hasIcon && props.$iconPosition === 'left' ? 'padding-left: 12px;' : ''}
      ${props.$hasIcon && props.$iconPosition === 'right' ? 'padding-right: 12px;' : ''}
    `;
  }}
  
  i {
    ${props => props.$iconPosition === 'left' ? 'margin-right: 8px;' : ''}
    ${props => props.$iconPosition === 'right' ? 'margin-left: 8px;' : ''}
    ${props => !props.children ? 'margin: 0;' : ''}
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
  margin-right: ${props => props.children ? '8px' : '0'};
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ModernButton: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  isLoading = false,
  children,
  ...props
}) => {
  const hasIcon = !!icon;
  
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $hasIcon={hasIcon}
      $iconPosition={iconPosition}
      $fullWidth={fullWidth}
      $isLoading={isLoading}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      {!isLoading && hasIcon && iconPosition === 'left' && <Icon icon={icon} />}
      {children}
      {!isLoading && hasIcon && iconPosition === 'right' && <Icon icon={icon} />}
    </StyledButton>
  );
};

export default ModernButton;