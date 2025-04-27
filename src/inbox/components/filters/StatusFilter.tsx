import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { modernColors, spacing, typography } from '../../../styles/theme';
import FilterPopover from '../../../components/common/FilterPopover';
import FilterItem from '../../../components/common/FilterItem';
import { __ } from '@octobots/ui/src/utils/core';
import { Alert } from '@octobots/ui/src/utils';
import client from '@octobots/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { queries } from "@octobots/ui-inbox/src/inbox/graphql";
import { generateParams } from "@octobots/ui-inbox/src/inbox/utils";
import { useLocation, useNavigate } from 'react-router-dom';
import { router as routerUtils } from '@octobots/ui/src/utils';

const StatusFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

interface StatusFilterProps {
  queryParams: any;
  refetchRequired?: string;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ queryParams, refetchRequired }) => {
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
    routerUtils.setParams(navigate, location, {
      status: undefined,
    });
  };

  const handleFilterClick = (paramName: string, paramValue: string) => {
    clearStatusFilter();
    routerUtils.setParams(navigate, location, { [paramName]: paramValue });
  };

  const isFilterActive = () => {
    return (
      !!queryParams.status
    );
  };

  const getActiveFilter = () => {
    if (queryParams.status === 'open') return 'Open';
    if (queryParams.status === 'resolved') return 'Resolved';
    if (queryParams.status === 'pending') return 'Pending';
    if (queryParams.status === 'bot') return 'Bot';
    return 'Status';
  };

  return (
    <FilterPopover 
      label={getActiveFilter()} 
      icon="filter" 
      isActive={isFilterActive()}
      onClear={clearStatusFilter}
    >
      <StatusFilterContainer>
        <FilterItem
          label="Open"
          count={counts.open}
          active={queryParams.status === 'open'}
          onClick={() => handleFilterClick('status', 'open')}
        />
        <FilterItem
          label="Resolved"
          count={counts.resolved}
          active={queryParams.status === 'resolved'}
          onClick={() => handleFilterClick('status', 'resolved')}
        />
        <FilterItem
          label="Pending"
          count={counts.pending}
          active={queryParams.status === 'pending'}
          onClick={() => handleFilterClick('status', 'pending')}
        />
        <FilterItem
          label="Bot"
          count={counts.bot}
          active={queryParams.status === 'bot'}
          onClick={() => handleFilterClick('status', 'bot')}
        />
      </StatusFilterContainer>
    </FilterPopover>
  );
};

export default StatusFilter;