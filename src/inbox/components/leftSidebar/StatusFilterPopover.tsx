import { Alert, __, router } from 'coreui/utils';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Icon from '@octobots/ui/src/components/Icon';
import { Popover } from '@headlessui/react';
import Spinner from '@octobots/ui/src/components/Spinner';
import client from '@octobots/ui/src/apolloClient';
import { generateParams } from '@octobots/ui-inbox/src/inbox/utils';
import { gql } from '@apollo/client';
import { queries } from '@octobots/ui-inbox/src/inbox/graphql';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions } from '../../../styles/theme';

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.sm} ${spacing.md};
  background-color: ${modernColors.messageBackground};
  border: none;
  border-radius: ${borderRadius.md};
  color: ${modernColors.textPrimary};
  font-size: ${typography.fontSizes.md};
  cursor: pointer;
  transition: all ${transitions.fast};
  
  &:hover {
    background-color: ${modernColors.hover};
  }
  
  &[aria-expanded="true"] {
    background-color: ${modernColors.active};
  }
  
  i {
    color: ${modernColors.textSecondary};
    transition: transform ${transitions.fast};
  }
  
  &[aria-expanded="true"] i {
    transform: rotate(180deg);
  }
`;

const PopoverPanel = styled.div`
  position: absolute;
  z-index: 10;
  margin-top: ${spacing.sm};
  background-color: ${modernColors.contentBackground};
  border-radius: ${borderRadius.md};
  box-shadow: 0 4px 12px ${modernColors.shadow};
  width: 280px;
  overflow: hidden;
`;

const PopoverHeader = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  border-bottom: 1px solid ${modernColors.border};
  font-weight: ${typography.fontWeights.medium};
  color: ${modernColors.textPrimary};
`;

const FilterList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const FilterItem = styled.li`
  a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${spacing.md} ${spacing.lg};
    color: ${modernColors.textPrimary};
    text-decoration: none;
    transition: all ${transitions.fast};
    
    &:hover {
      background-color: ${modernColors.hover};
    }
    
    &.active {
      background-color: ${modernColors.active};
      color: ${modernColors.primary};
      font-weight: ${typography.fontWeights.medium};
    }
  }
`;

const FilterCount = styled.span`
  color: ${modernColors.textSecondary};
  font-size: ${typography.fontSizes.sm};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl};
`;

type Props = {
  queryParams: any;
  refetchRequired: string;
};

const StatusFilterPopover: React.FC<Props> = ({
  queryParams,
  refetchRequired,
}) => {
  const [counts, setCounts] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchData = (ignoreCache = false) => {
    client
      .query({
        query: gql(queries.conversationCounts),
        variables: generateParams(queryParams),
        fetchPolicy: ignoreCache ? 'network-only' : 'cache-first',
      })
      .then(({ data, loading }: { data: any; loading: boolean }) => {
        setCounts(data.conversationCounts);
        setLoading(loading);
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (refetchRequired) {
      fetchData(true);
    }
  }, [refetchRequired]);

  const clearStatusFilter = () => {
    router.setParams(navigate, location, {
      participating: '',
      status: '',
      unassigned: '',
      starred: '',
      awaitingResponse: '',
    });
  };

  const renderSingleFilter = (
    paramName: string,
    paramValue: string,
    text: string,
    count: number,
  ) => {
    const onClick = (e: React.MouseEvent) => {
      e.preventDefault();
      clearStatusFilter();
      router.setParams(navigate, location, { [paramName]: paramValue });
    };

    const isActive = router.getParam(location, [paramName]) === paramValue;

    return (
      <FilterItem>
        <a
          href="#"
          className={isActive ? 'active' : ''}
          onClick={onClick}
        >
          {__(text)}
          <FilterCount>{count}</FilterCount>
        </a>
      </FilterItem>
    );
  };

  const renderPopoverContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <Spinner objective={true} />
        </LoadingContainer>
      );
    }

    return (
      <FilterList>
        {renderSingleFilter(
          'unassigned',
          'true',
          'Unassigned',
          counts.unassigned,
        )}
        {renderSingleFilter(
          'participating',
          'true',
          'Participating',
          counts.participating,
        )}
        {renderSingleFilter(
          'awaitingResponse',
          'true',
          'Awaiting Response',
          counts.awaitingResponse,
        )}
        {renderSingleFilter('status', 'closed', 'Resolved', counts.resolved)}
      </FilterList>
    );
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button as={FilterButton}>
            {__("Status")}
            <Icon icon={open ? 'angle-up' : 'angle-down'} />
          </Popover.Button>
          
          <Popover.Panel as={PopoverPanel}>
            <PopoverHeader>{__('Filter by status')}</PopoverHeader>
            {renderPopoverContent()}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default StatusFilterPopover;