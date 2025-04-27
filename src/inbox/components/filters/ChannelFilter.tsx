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

const ChannelFilterContainer = styled.div`
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

const ChannelList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ChannelItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${spacing.sm} 0;
  gap: ${spacing.md};
`;

const ChannelName = styled.div`
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textPrimary};
`;

interface ChannelFilterProps {
  queryParams: any;
  currentUser: any;
}

const ChannelFilter: React.FC<ChannelFilterProps> = ({ queryParams, currentUser }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(queryParams.channelId || '');
  const location = useLocation();
  const navigate = useNavigate();

  const { data, loading } = useQuery(gql(queries.channelsByMembers), {
    variables: { 
      memberIds: [currentUser._id],
      searchValue
    }
  });

  useEffect(() => {
    setSelectedChannelId(queryParams.channelId || '');
  }, [queryParams.channelId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleChannelSelect = (channelId: string) => {
    if (selectedChannelId === channelId) {
      setSelectedChannelId('');
    } else {
      setSelectedChannelId(channelId);
    }
  };

  const handleApply = () => {
    routerUtils.setParams(navigate, location, {
      channelId: selectedChannelId
    });
  };

  const handleClear = () => {
    setSelectedChannelId('');
    routerUtils.setParams(navigate, location, {
      channelId: ''
    });
  };

  const isFilterActive = () => {
    return !!queryParams.channelId;
  };

  const getActiveLabel = () => {
    if (isFilterActive()) {
      const channels = data?.channelsByMembers || [];
      const selectedChannel = channels.find(channel => channel._id === queryParams.channelId);
      
      if (selectedChannel) {
        return selectedChannel.name;
      }
    }
    
    return 'Channel';
  };

  const channels = data?.channelsByMembers || [];

  return (
    <FilterPopover 
      label={getActiveLabel()} 
      icon="sitemap-1" 
      isActive={isFilterActive()}
      onClear={handleClear}
      onApply={handleApply}
    >
      <ChannelFilterContainer>
        <SearchInput>
          <i className="icon-search"></i>
          <input
            type="text"
            placeholder="Search channels..."
            value={searchValue}
            onChange={handleSearchChange}
          />
        </SearchInput>
        
        <ChannelList>
          {channels.map(channel => (
            <ChannelItem key={channel._id}>
              <Checkbox
                checked={selectedChannelId === channel._id}
                onChange={() => handleChannelSelect(channel._id)}
              />
              <ChannelName>{channel.name}</ChannelName>
            </ChannelItem>
          ))}
          
          {channels.length === 0 && !loading && (
            <div style={{ padding: spacing.md, color: modernColors.textSecondary }}>
              No channels found
            </div>
          )}
        </ChannelList>
      </ChannelFilterContainer>
    </FilterPopover>
  );
};

export default ChannelFilter;