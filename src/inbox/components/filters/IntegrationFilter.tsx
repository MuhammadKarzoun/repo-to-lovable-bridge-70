import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { modernColors, spacing, typography } from '../../../styles/theme';
import FilterPopover from '../../../components/common/FilterPopover';
import { __ } from '@octobots/ui/src/utils/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { router as routerUtils } from '@octobots/ui/src/utils';
import { gql, useQuery } from '@apollo/client';
import { queries } from "@octobots/ui-inbox/src/inbox/graphql";
import Checkbox from '../../../components/common/Checkbox';
import { cleanIntegrationKind } from '@octobots/ui/src/utils';

const IntegrationFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const SearchInput = styled.div`
  position: relative;
  margin-bottom: ${spacing.md};
  
  input {
    width: 100%;
    padding: ${spacing.sm} ${spacing.md} ${spacing.sm} 36px;
    border: 1px solid ${modernColors.border};
    border-radius: 4px;
    font-size: ${typography.fontSizes.md};
    
    &:focus {
      outline: none;
      border-color: ${modernColors.primary};
      box-shadow: 0 0 0 2px ${modernColors.primary}20;
    }
  }
  
  i {
    position: absolute;
    left: ${spacing.md};
    top: 50%;
    transform: translateY(-50%);
    color: ${modernColors.textSecondary};
  }
`;

const IntegrationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const IntegrationItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${spacing.sm} 0;
  gap: ${spacing.md};
`;

const IntegrationName = styled.div`
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textPrimary};
`;

interface IntegrationFilterProps {
  queryParams: any;
}

const IntegrationFilter: React.FC<IntegrationFilterProps> = ({ queryParams }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedIntegration, setSelectedIntegration] = useState<string>(queryParams.integrationId || '');
  const location = useLocation();
  const navigate = useNavigate();

  const { data, loading } = useQuery(gql(queries.integrationsList));

  useEffect(() => {
    setSelectedIntegration(queryParams.integrationId || '');
  }, [queryParams.integrationId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleIntegrationSelect = (integrationId: string) => {
    if (selectedIntegration === integrationId) {
      setSelectedIntegration('');
    } else {
      setSelectedIntegration(integrationId);
    }
  };

  const handleApply = () => {
    routerUtils.setParams(navigate, location, {
      integrationId: selectedIntegration
    });
  };

  const handleClear = () => {
    setSelectedIntegration('');
    routerUtils.setParams(navigate, location, {
      integrationId: ''
    });
  };

  const isFilterActive = () => {
    return !!queryParams.integrationId;
  };

  const getActiveLabel = () => {
    if (isFilterActive()) {
      return cleanIntegrationKind(integrations.find(integration => integration._id === selectedIntegration)?.name || '');
    }
    
    return 'Integration';
  };

  const integrations = data?.integrations || [];
  const filteredIntegrations = integrations.filter(integration => 
    integration._id.toLowerCase().includes(searchValue.toLowerCase())
  );

  console.log('Filtered Integrations:', filteredIntegrations);

  return (
    <FilterPopover 
      label={getActiveLabel()} 
      icon="plug" 
      isActive={isFilterActive()}
      onClear={handleClear}
      onApply={handleApply}
    >
      <IntegrationFilterContainer>
        <SearchInput>
          <i className="icon-search"></i>
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchValue}
            onChange={handleSearchChange}
          />
        </SearchInput>
        
        <IntegrationList>
          {filteredIntegrations.map(integration => (
            <IntegrationItem key={integration._id}>
              <Checkbox
                checked={selectedIntegration === integration._id}
                onChange={() => handleIntegrationSelect(integration._id)}
              />
              <IntegrationName>{cleanIntegrationKind(integration.name)}</IntegrationName>
            </IntegrationItem>
          ))}
          
          {filteredIntegrations.length === 0 && !loading && (
            <div style={{ padding: spacing.md, color: modernColors.textSecondary }}>
              {__('No integrations found')}
            </div>
          )}
        </IntegrationList>
      </IntegrationFilterContainer>
    </FilterPopover>
  );
};

export default IntegrationFilter;