import React from 'react';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions } from '../../styles/theme';

const FilterItemWrapper = styled.div<{ $active?: boolean }>`
  padding: ${spacing.md};
  border-radius: ${borderRadius.md};
  background-color: ${props => props.$active ? modernColors.active : 'transparent'};
  color: ${props => props.$active ? modernColors.primary : modernColors.textPrimary};
  cursor: pointer;
  transition: all ${transitions.fast};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background-color: ${props => props.$active ? modernColors.active : modernColors.hover};
  }
`;

const FilterLabel = styled.div`
  font-size: ${typography.fontSizes.md};
`;

const FilterCount = styled.div`
  font-size: ${typography.fontSizes.sm};
  color: ${modernColors.textSecondary};
`;

interface FilterItemProps {
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
}

const FilterItem: React.FC<FilterItemProps> = ({
  label,
  count,
  active = false,
  onClick
}) => {
  return (
    <FilterItemWrapper $active={active} onClick={onClick}>
      <FilterLabel>{label}</FilterLabel>
      {count !== undefined && <FilterCount>{count}</FilterCount>}
    </FilterItemWrapper>
  );
};

export default FilterItem;