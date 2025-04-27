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

const BrandFilterContainer = styled.div`
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

const BrandList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const BrandItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${spacing.sm} 0;
  gap: ${spacing.md};
`;

const BrandName = styled.div`
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textPrimary};
`;

interface BrandFilterProps {
  queryParams: any;
}

const BrandFilter: React.FC<BrandFilterProps> = ({ queryParams }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>(queryParams.brandId || '');
  const location = useLocation();
  const navigate = useNavigate();

  const { data, loading } = useQuery(gql(queries.brandList), {
    variables: { searchValue }
  });

  useEffect(() => {
    setSelectedBrandId(queryParams.brandId || '');
  }, [queryParams.brandId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleBrandSelect = (brandId: string) => {
    if (selectedBrandId === brandId) {
      setSelectedBrandId('');
    } else {
      setSelectedBrandId(brandId);
    }
  };

  const handleApply = () => {
    routerUtils.setParams(navigate, location, {
      brandId: selectedBrandId
    });
  };

  const handleClear = () => {
    setSelectedBrandId('');
    routerUtils.setParams(navigate, location, {
      brandId: ''
    });
  };

  const isFilterActive = () => {
    return !!queryParams.brandId;
  };

  const getActiveLabel = () => {
    if (isFilterActive()) {
      const brands = data?.brands || [];
      const selectedBrand = brands.find(brand => brand._id === queryParams.brandId);
      
      if (selectedBrand) {
        return selectedBrand.name;
      }
    }
    
    return 'Brand';
  };

  const brands = data?.brands || [];

  return (
    <FilterPopover 
      label={getActiveLabel()} 
      icon="building" 
      isActive={isFilterActive()}
      onClear={handleClear}
      onApply={handleApply}
    >
      <BrandFilterContainer>
        <SearchInput>
          <i className="icon-search"></i>
          <input
            type="text"
            placeholder="Search brands..."
            value={searchValue}
            onChange={handleSearchChange}
          />
        </SearchInput>
        
        <BrandList>
          {brands.map(brand => (
            <BrandItem key={brand._id}>
              <Checkbox
                checked={selectedBrandId === brand._id}
                onChange={() => handleBrandSelect(brand._id)}
              />
              <BrandName>{brand.name}</BrandName>
            </BrandItem>
          ))}
          
          {brands.length === 0 && !loading && (
            <div style={{ padding: spacing.md, color: modernColors.textSecondary }}>
              No brands found
            </div>
          )}
        </BrandList>
      </BrandFilterContainer>
    </FilterPopover>
  );
};

export default BrandFilter;