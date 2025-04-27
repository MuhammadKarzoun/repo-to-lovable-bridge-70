import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { modernColors, spacing, typography } from '../../../styles/theme';
import FilterPopover from '../../../components/common/FilterPopover';
import Select from '../../../components/common/Select';
import Checkbox from '../../../components/common/Checkbox';
import { __ } from '@octobots/ui/src/utils/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { router as routerUtils } from '@octobots/ui/src/utils';

const SortFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const SortFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const SortDirectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const SectionTitle = styled.div`
  font-size: ${typography.fontSizes.md};
  font-weight: ${typography.fontWeights.medium};
  color: ${modernColors.textPrimary};
  margin-bottom: ${spacing.xs};
`;

interface SortFilterProps {
  queryParams: any;
}

const SortFilter: React.FC<SortFilterProps> = ({ queryParams }) => {
  const [sortField, setSortField] = useState<string>(queryParams.sortField || 'updatedAt');
  const [sortDirection, setSortDirection] = useState<string>(queryParams.sortDirection || '0');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSortField(queryParams.sortField || 'updatedAt');
    setSortDirection(queryParams.sortDirection || '0');
  }, [queryParams.sortField, queryParams.sortDirection]);

  const sortFieldOptions = [
    { value: 'createdAt', label: 'Creation Date' },
    { value: 'updatedAt', label: 'Last Interaction Date' },
    { value: 'pendingResponseDate', label: 'Pending Response Date' },
  ];

  const handleApply = () => {
    routerUtils.setParams(navigate, location, {
      sortField,
      sortDirection
    });
  };

  const handleClear = () => {
    setSortField('updatedAt');
    setSortDirection('0');
    routerUtils.setParams(navigate, location, {
      sortField: 'updatedAt',
      sortDirection: '0'
    });
  };

  const isFilterActive = () => {
    return (
      queryParams.sortField && queryParams.sortField !== 'updatedAt' ||
      queryParams.sortDirection && queryParams.sortDirection !== '0'
    );
  };

  const getActiveLabel = () => {
    if (isFilterActive()) {
      const field = sortFieldOptions.find(option => option.value === queryParams.sortField)?.label || 'Sort';
      const direction = queryParams.sortDirection === '1' ? 'Asc' : 'Desc';
      return `${field} ${direction}`;
    }
    
    return 'Sort';
  };

  return (
    <FilterPopover 
      label={getActiveLabel()} 
      icon="sort-amount-down" 
      isActive={isFilterActive()}
      onClear={handleClear}
      onApply={handleApply}
    >
      <SortFilterContainer>
        <SortFieldContainer>
          <SectionTitle>Sort by</SectionTitle>
          <Select
            options={sortFieldOptions}
            value={sortField}
            onChange={setSortField}
            placeholder="Select field to sort by"
          />
        </SortFieldContainer>
        
        <SortDirectionContainer>
          <SectionTitle>Direction</SectionTitle>
          <Checkbox
            checked={sortDirection === '1'}
            onChange={(checked) => setSortDirection(checked ? '1' : '0')}
            label="Ascending (oldest first)"
          />
          <Checkbox
            checked={sortDirection === '0'}
            onChange={(checked) => setSortDirection(checked ? '0' : '1')}
            label="Descending (newest first)"
          />
        </SortDirectionContainer>
      </SortFilterContainer>
    </FilterPopover>
  );
};

export default SortFilter;