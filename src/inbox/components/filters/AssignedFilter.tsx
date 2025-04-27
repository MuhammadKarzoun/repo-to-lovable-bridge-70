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
import Avatar from '../../../components/common/Avatar';
import { IUser } from '@octobots/ui/src/auth/types';

const AssignedFilterContainer = styled.div`
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

const UserList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${spacing.sm} 0;
  gap: ${spacing.md};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textPrimary};
`;

const UserEmail = styled.div`
  font-size: ${typography.fontSizes.sm};
  color: ${modernColors.textSecondary};
`;

interface AssignedFilterProps {
  queryParams: any;
  currentUser: IUser;
}

const AssignedFilter: React.FC<AssignedFilterProps> = ({ queryParams, currentUser }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>(queryParams.assignedUserId || '');
  const [isUnassigned, setIsUnassigned] = useState<boolean>(queryParams.unassigned === 'true');
  const location = useLocation();
  const navigate = useNavigate();

  const { data, loading } = useQuery(gql(queries.userList), {
    variables: { searchValue }
  });

  useEffect(() => {
    setSelectedUserId(queryParams.assignedUserId || '');
    setIsUnassigned(queryParams.unassigned === 'true');
  }, [queryParams.assignedUserId, queryParams.unassigned]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleUserSelect = (userId: string) => {
    if (selectedUserId === userId) {
      setSelectedUserId('');
    } else {
      setSelectedUserId(userId);
      setIsUnassigned(false);
    }
  };

  const handleUnassignedToggle = (checked: boolean) => {
    setIsUnassigned(checked);
    if (checked) {
      setSelectedUserId('');
    }
  };

  const handleApply = () => {
    if (isUnassigned) {
      routerUtils.setParams(navigate, location, {
        assignedUserId: undefined,
        unassigned: 'true'
      });
    } else if (selectedUserId) {
      routerUtils.setParams(navigate, location, {
        assignedUserId: selectedUserId,
        unassigned: undefined,
      });
    } else {
      routerUtils.setParams(navigate, location, {
        assignedUserId: undefined,
        unassigned: undefined,
      });
    }
  };

  const handleClear = () => {
    setSelectedUserId('');
    setIsUnassigned(false);
    routerUtils.setParams(navigate, location, {
      assignedUserId: undefined,
      unassigned: undefined
    });
  };

  const isFilterActive = () => {
    return !!queryParams.assignedUserId || queryParams.unassigned === 'true';
  };

  const getActiveLabel = () => {
    if (queryParams.unassigned === 'true') {
      return 'Unassigned';
    }
    
    if (queryParams.assignedUserId) {
      if (queryParams.assignedUserId === currentUser._id) {
        return 'Assigned to me';
      }
      
      const users = data?.users || [];
      const selectedUser = users.find((user: IUser) => user._id === queryParams.assignedUserId);
      
      if (selectedUser) {
        return `Assigned to ${selectedUser.details?.fullName || selectedUser.email}`;
      }
      
      return 'Assigned';
    }
    
    return 'Assigned';
  };

  const users = data?.users || [];

  return (
    <FilterPopover 
      label={getActiveLabel()} 
      icon="user-check" 
      isActive={isFilterActive()}
      onClear={handleClear}
      onApply={handleApply}
    >
      <AssignedFilterContainer>
        <Checkbox
          checked={selectedUserId === currentUser._id}
          onChange={(checked) => {
            if (checked) {
              handleUserSelect(currentUser._id);
            } else {
              setSelectedUserId('');
            }
          }}
          label="Assigned to me"
        />
        
        <Checkbox
          checked={isUnassigned}
          onChange={handleUnassignedToggle}
          label="Unassigned"
        />
        
        <SearchInput>
          <i className="icon-search"></i>
          <input
            type="text"
            placeholder="Search team members..."
            value={searchValue}
            onChange={handleSearchChange}
          />
        </SearchInput>
        
        <UserList>
          {users.map((user: IUser) => (
            <UserItem key={user._id}>
              <Checkbox
                checked={selectedUserId === user._id}
                onChange={() => handleUserSelect(user._id)}
              />
              <Avatar user={user} size={32} />
              <UserInfo>
                <UserName>{user.details?.fullName || 'Unknown'}</UserName>
                <UserEmail>{user.email}</UserEmail>
              </UserInfo>
            </UserItem>
          ))}
        </UserList>
      </AssignedFilterContainer>
    </FilterPopover>
  );
};

export default AssignedFilter;