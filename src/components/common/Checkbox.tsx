import React from 'react';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions } from '../../styles/theme';
import Icon from '@octobots/ui/src/components/Icon';

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: ${spacing.sm};
  padding: ${spacing.sm} 0;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
`;

const StyledCheckbox = styled.div<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background-color: ${props => props.$checked ? modernColors.primary : 'transparent'};
  border: 1px solid ${props => props.$checked ? modernColors.primary : modernColors.border};
  border-radius: ${borderRadius.sm};
  transition: all ${transitions.fast};
  
  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 2px ${modernColors.primary}20;
  }
  
  i {
    visibility: ${props => props.$checked ? 'visible' : 'hidden'};
    color: white;
    font-size: 12px;
  }
`;

const CheckboxLabel = styled.span`
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textPrimary};
`;

interface CheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  id?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  id
}) => {
  return (
    <CheckboxContainer>
      <HiddenCheckbox 
        id={id}
        checked={checked} 
        onChange={onChange} 
      />
      <StyledCheckbox $checked={checked}>
        <Icon icon="check" />
      </StyledCheckbox>
      {label && <CheckboxLabel>{label}</CheckboxLabel>}
    </CheckboxContainer>
  );
};

export default Checkbox;