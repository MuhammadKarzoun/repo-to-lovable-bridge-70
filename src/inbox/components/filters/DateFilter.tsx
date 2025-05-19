import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { modernColors, spacing } from '../../../styles/theme';
import FilterPopover from '../../../components/common/FilterPopover';
import DateRangePicker from '../../../components/common/DateRangePicker';
import { __ } from '@octobots/ui/src/utils/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { router as routerUtils } from '@octobots/ui/src/utils';

const DateFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

interface DateFilterProps {
  queryParams: any;
}

const DateFilter: React.FC<DateFilterProps> = ({ queryParams }) => {
  const [startDate, setStartDate] = useState<string>(queryParams.startDate || '');
  const [endDate, setEndDate] = useState<string>(queryParams.endDate || '');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setStartDate(queryParams.startDate || '');
    setEndDate(queryParams.endDate || '');
  }, [queryParams.startDate, queryParams.endDate]);

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
  };

  const handleApply = () => {
    routerUtils.setParams(navigate, location, {
      startDate,
      endDate
    });
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    routerUtils.setParams(navigate, location, {
      startDate: '',
      endDate: ''
    });
  };

  const isFilterActive = () => {
    return !!queryParams.startDate || !!queryParams.endDate;
  };

  const getActiveLabel = () => {
    if (isFilterActive()) {
      const start = queryParams.startDate ? new Date(queryParams.startDate).toLocaleDateString() : '';
      const end = queryParams.endDate ? new Date(queryParams.endDate).toLocaleDateString() : '';
      
      if (start && end) {
        return `${start} - ${end}`;
      } else if (start) {
        return `From ${start}`;
      } else if (end) {
        return `Until ${end}`;
      }
    }
    
    return '';
  };

  return (
    <FilterPopover 
      label={getActiveLabel()} 
      icon="calendar-alt" 
      isActive={isFilterActive()}
      onClear={handleClear}
      onApply={handleApply}
    >
      <DateFilterContainer>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
      </DateFilterContainer>
    </FilterPopover>
  );
};

export default DateFilter;