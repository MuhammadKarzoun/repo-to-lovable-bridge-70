import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { modernColors, spacing, typography, borderRadius } from '../../../styles/theme';
import FilterPopover from '../../../components/common/FilterPopover';
import { __ } from '@octobots/ui/src/utils/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { router as routerUtils } from '@octobots/ui/src/utils';
import { gql, useQuery } from '@apollo/client';
import { queries } from "@octobots/ui-inbox/src/inbox/graphql";
import { TAG_TYPES } from '@octobots/ui-tags/src/constants';
import Checkbox from '../../../components/common/Checkbox';

const TagFilterContainer = styled.div`
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

const TagList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const TagItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${spacing.sm} 0;
  gap: ${spacing.md};
`;

const TagColor = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: ${borderRadius.sm};
  background-color: ${props => props.$color || modernColors.primary};
`;

const TagName = styled.div`
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textPrimary};
`;

interface TagFilterProps {
  queryParams: any;
}

const TagFilter: React.FC<TagFilterProps> = ({ queryParams }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    queryParams.tag ? queryParams.tag.split(',') : []
  );
  const location = useLocation();
  const navigate = useNavigate();

  const { data, loading } = useQuery(gql(queries.tagList), {
    variables: { 
      type: TAG_TYPES.CONVERSATION,
      searchValue
    }
  });

  useEffect(() => {
    setSelectedTags(queryParams.tag ? queryParams.tag.split(',') : []);
  }, [queryParams.tag]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleApply = () => {
    routerUtils.setParams(navigate, location, {
      tag: selectedTags.join(',')
    });
  };

  const handleClear = () => {
    setSelectedTags([]);
    routerUtils.setParams(navigate, location, {
      tag: ''
    });
  };

  const isFilterActive = () => {
    return !!queryParams.tag;
  };

  const getActiveLabel = () => {
    if (isFilterActive()) {
      const tags = data?.tags || [];
      const selectedTagNames = selectedTags
        .map(tagId => {
          const tag = tags.find(t => t._id === tagId);
          return tag ? tag.name : '';
        })
        .filter(Boolean);
      
      if (selectedTagNames.length === 1) {
        return selectedTagNames[0];
      } else if (selectedTagNames.length > 1) {
        return `${selectedTagNames.length} tags`;
      }
    }
    
    return 'Tags';
  };

  const tags = data?.tags || [];

  return (
    <FilterPopover 
      label={getActiveLabel()} 
      icon="tag-alt" 
      isActive={isFilterActive()}
      onClear={handleClear}
      onApply={handleApply}
    >
      <TagFilterContainer>
        <SearchInput>
          <i className="icon-search"></i>
          <input
            type="text"
            placeholder="Search tags..."
            value={searchValue}
            onChange={handleSearchChange}
          />
        </SearchInput>
        
        <TagList>
          {tags.map(tag => (
            <TagItem key={tag._id}>
              <Checkbox
                checked={selectedTags.includes(tag._id)}
                onChange={() => handleTagToggle(tag._id)}
              />
              <TagColor $color={tag.colorCode} />
              <TagName>{tag.name}</TagName>
            </TagItem>
          ))}
          
          {tags.length === 0 && !loading && (
            <div style={{ padding: spacing.md, color: modernColors.textSecondary }}>
              No tags found
            </div>
          )}
        </TagList>
      </TagFilterContainer>
    </FilterPopover>
  );
};

export default TagFilter;