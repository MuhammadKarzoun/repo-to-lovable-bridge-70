import React, { useState } from 'react';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions } from '../../styles/theme';
import Icon from '@octobots/ui/src/components/Icon';

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectLabel = styled.label`
  display: block;
  margin-bottom: ${spacing.xs};
  font-size: ${typography.fontSizes.sm};
  color: ${modernColors.textSecondary};
`;

const StyledSelect = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${spacing.sm} ${spacing.md};
  background-color: ${modernColors.contentBackground};
  border: 1px solid ${props => props.$isOpen ? modernColors.primary : modernColors.border};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  transition: all ${transitions.fast};
  
  &:hover {
    border-color: ${modernColors.primary};
  }
  
  ${props => props.$isOpen && `
    box-shadow: 0 0 0 2px ${modernColors.primary}20;
  `}
`;

const SelectValue = styled.div`
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SelectPlaceholder = styled.div`
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textSecondary};
`;

const SelectIcon = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  color: ${modernColors.textSecondary};
  transition: transform ${transitions.fast};
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
`;

const SelectDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + ${spacing.xs});
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background-color: ${modernColors.contentBackground};
  border: 1px solid ${modernColors.border};
  border-radius: ${borderRadius.md};
  box-shadow: 0 4px 12px ${modernColors.shadow};
  z-index: 10;
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

const SelectOption = styled.div<{ $isSelected: boolean }>`
  padding: ${spacing.md};
  cursor: pointer;
  transition: all ${transitions.fast};
  background-color: ${props => props.$isSelected ? modernColors.active : 'transparent'};
  color: ${props => props.$isSelected ? modernColors.primary : modernColors.textPrimary};
  
  &:hover {
    background-color: ${modernColors.hover};
  }
`;

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <SelectContainer ref={selectRef}>
      {label && <SelectLabel>{label}</SelectLabel>}
      
      <StyledSelect $isOpen={isOpen} onClick={toggleDropdown}>
        {selectedOption ? (
          <SelectValue>{selectedOption.label}</SelectValue>
        ) : (
          <SelectPlaceholder>{placeholder}</SelectPlaceholder>
        )}
        <SelectIcon $isOpen={isOpen}>
          <Icon icon="angle-down" />
        </SelectIcon>
      </StyledSelect>
      
      <SelectDropdown $isOpen={isOpen}>
        {options.map(option => (
          <SelectOption
            key={option.value}
            $isSelected={option.value === value}
            onClick={() => handleOptionClick(option.value)}
          >
            {option.label}
          </SelectOption>
        ))}
      </SelectDropdown>
    </SelectContainer>
  );
};

export default Select;