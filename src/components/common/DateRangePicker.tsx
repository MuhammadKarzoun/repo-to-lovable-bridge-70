import React, { useState } from 'react';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions } from '../../styles/theme';
import Icon from '@octobots/ui/src/components/Icon';
import dayjs from 'dayjs';

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const DateInputGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const DateInputWrapper = styled.div`
  flex: 1;
`;

const DateInputLabel = styled.label`
  display: block;
  margin-bottom: ${spacing.xs};
  font-size: ${typography.fontSizes.sm};
  color: ${modernColors.textSecondary};
`;

const DateInput = styled.input`
  width: 100%;
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${modernColors.border};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textPrimary};
  background-color: ${modernColors.contentBackground};
  transition: all ${transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${modernColors.primary};
    box-shadow: 0 0 0 2px ${modernColors.primary}20;
  }
  
  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
    filter: invert(0.5);
  }
`;

const QuickDateButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
`;

const QuickDateButton = styled.button<{ $active?: boolean }>`
  padding: ${spacing.xs} ${spacing.sm};
  background-color: ${props => props.$active ? modernColors.primary : modernColors.messageBackground};
  color: ${props => props.$active ? 'white' : modernColors.textPrimary};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSizes.sm};
  cursor: pointer;
  transition: all ${transitions.fast};
  
  &:hover {
    background-color: ${props => props.$active ? modernColors.primary : modernColors.hover};
  }
`;

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  const [activeQuickOption, setActiveQuickOption] = useState<string | null>(null);
  
  const handleQuickOptionClick = (option: string) => {
    setActiveQuickOption(option);
    
    const today = dayjs();
    let start = '';
    let end = today.format('YYYY-MM-DD');
    
    switch (option) {
      case 'today':
        start = today.format('YYYY-MM-DD');
        break;
      case 'yesterday':
        start = today.subtract(1, 'day').format('YYYY-MM-DD');
        end = start;
        break;
      case 'thisWeek':
        start = today.startOf('week').format('YYYY-MM-DD');
        break;
      case 'lastWeek':
        start = today.subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
        end = today.subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
        break;
      case 'thisMonth':
        start = today.startOf('month').format('YYYY-MM-DD');
        break;
      case 'lastMonth':
        start = today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        end = today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
        break;
      case 'last30Days':
        start = today.subtract(30, 'day').format('YYYY-MM-DD');
        break;
      case 'last90Days':
        start = today.subtract(90, 'day').format('YYYY-MM-DD');
        break;
      default:
        break;
    }
    
    onStartDateChange(start);
    onEndDateChange(end);
  };
  
  return (
    <DateRangeContainer>
      <QuickDateButtons>
        <QuickDateButton 
          $active={activeQuickOption === 'today'} 
          onClick={() => handleQuickOptionClick('today')}
        >
          Today
        </QuickDateButton>
        <QuickDateButton 
          $active={activeQuickOption === 'yesterday'} 
          onClick={() => handleQuickOptionClick('yesterday')}
        >
          Yesterday
        </QuickDateButton>
        <QuickDateButton 
          $active={activeQuickOption === 'thisWeek'} 
          onClick={() => handleQuickOptionClick('thisWeek')}
        >
          This Week
        </QuickDateButton>
        <QuickDateButton 
          $active={activeQuickOption === 'lastWeek'} 
          onClick={() => handleQuickOptionClick('lastWeek')}
        >
          Last Week
        </QuickDateButton>
        <QuickDateButton 
          $active={activeQuickOption === 'thisMonth'} 
          onClick={() => handleQuickOptionClick('thisMonth')}
        >
          This Month
        </QuickDateButton>
        <QuickDateButton 
          $active={activeQuickOption === 'lastMonth'} 
          onClick={() => handleQuickOptionClick('lastMonth')}
        >
          Last Month
        </QuickDateButton>
        <QuickDateButton 
          $active={activeQuickOption === 'last30Days'} 
          onClick={() => handleQuickOptionClick('last30Days')}
        >
          Last 30 Days
        </QuickDateButton>
        <QuickDateButton 
          $active={activeQuickOption === 'last90Days'} 
          onClick={() => handleQuickOptionClick('last90Days')}
        >
          Last 90 Days
        </QuickDateButton>
      </QuickDateButtons>
      
      <DateInputGroup>
        <DateInputWrapper>
          <DateInputLabel>From</DateInputLabel>
          <DateInput 
            type="date" 
            value={startDate} 
            onChange={(e) => {
              onStartDateChange(e.target.value);
              setActiveQuickOption(null);
            }}
          />
        </DateInputWrapper>
        
        <DateInputWrapper>
          <DateInputLabel>To</DateInputLabel>
          <DateInput 
            type="date" 
            value={endDate} 
            onChange={(e) => {
              onEndDateChange(e.target.value);
              setActiveQuickOption(null);
            }}
          />
        </DateInputWrapper>
      </DateInputGroup>
    </DateRangeContainer>
  );
};

export default DateRangePicker;