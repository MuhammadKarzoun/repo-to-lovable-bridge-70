import React from "react";
import styled from "styled-components";
import { modernColors, spacing } from "../../../styles/theme";
import StatusFilter from "./StatusFilter";
import DateFilter from "./DateFilter";
import SortFilter from "./SortFilter";
import AssignedFilter from "./AssignedFilter";
import TagFilter from "./TagFilter";
import ChannelFilter from "./ChannelFilter";
import BrandFilter from "./BrandFilter";
import IntegrationFilter from "./IntegrationFilter";
import { IUser } from "@octobots/ui/src/auth/types";

const FilterBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${spacing.lg};
  margin-bottom: ${spacing.md};
  overflow-x: auto;
  gap: ${spacing.sm};

  &::-webkit-scrollbar {
    height: 0;
    display: none;
  }

  -ms-overflow-style: none;
  /* scrollbar-width: none; */
`;

interface FilterBarProps {
  queryParams: any;
  currentUser: IUser;
  refetchRequired?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  queryParams,
  currentUser,
  refetchRequired,
}) => {
  return (
    <FilterBarContainer>
      <StatusFilter
        queryParams={queryParams}
        refetchRequired={refetchRequired}
      />
      <AssignedFilter queryParams={queryParams} currentUser={currentUser} />
      <DateFilter queryParams={queryParams} />
      <TagFilter queryParams={queryParams} />
      <ChannelFilter queryParams={queryParams} currentUser={currentUser} />
      <BrandFilter queryParams={queryParams} />
      <IntegrationFilter queryParams={queryParams} />
      <SortFilter queryParams={queryParams} />
    </FilterBarContainer>
  );
};

export default FilterBar;
