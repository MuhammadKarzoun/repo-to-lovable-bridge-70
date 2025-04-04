import React, { useEffect, useState } from 'react';
import strip from 'strip';
import xss from 'xss';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions } from '../../../../styles/theme';
import getHighlightedText from './getHighlightedText';
import { IResponseTemplate } from '../../../../settings/responseTemplates/types';

const TemplateListContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const TemplateItem = styled.div<{ $active: boolean }>`
  padding: ${spacing.md} ${spacing.lg};
  cursor: pointer;
  transition: all ${transitions.fast};
  background-color: ${props => props.$active ? modernColors.active : 'transparent'};
  
  &:hover {
    background-color: ${modernColors.hover};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid ${modernColors.border};
  }
`;

const TemplateTitle = styled.div`
  font-weight: ${typography.fontWeights.medium};
  color: ${modernColors.textPrimary};
  margin-bottom: ${spacing.xs};
  
  strong {
    color: ${modernColors.primary};
  }
`;

const TemplateContent = styled.div`
  font-size: ${typography.fontSizes.sm};
  color: ${modernColors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  strong {
    color: ${modernColors.primary};
  }
`;

const EmptyState = styled.div`
  padding: ${spacing.lg};
  text-align: center;
  color: ${modernColors.textSecondary};
  
  i {
    font-size: 24px;
    margin-bottom: ${spacing.sm};
    display: block;
  }
`;

type TemplateListProps = {
  suggestionsState: {
    selectedIndex: number;
    searchText: string;
    templates: IResponseTemplate[];
  };
  onSelect: (index: number) => void;
};

// response templates
const TemplateList = (props: TemplateListProps) => {
  const { suggestionsState, onSelect } = props;
  const { searchText, templates } = suggestionsState;

  const [hoverIndex, setHoverIndex] = useState(0);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHoverIndex((hoverIndex + templates.length - 1) % templates.length);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHoverIndex((hoverIndex + 1) % templates.length);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      onSelect(hoverIndex);
    }
    if (event.key === 'Escape') {
      // Close the template list
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hoverIndex, templates]);

  if (!templates || templates.length === 0) {
    return (
      <EmptyState>
        <i className="icon-clipboard-1"></i>
        No matching templates found
      </EmptyState>
    );
  }

  return (
    <TemplateListContainer>
      {templates.map((template, index) => (
        <TemplateItem
          key={template._id}
          onClick={() => onSelect(index)}
          $active={hoverIndex === index}
        >
          <TemplateTitle>
            {getHighlightedText(xss(template.name), searchText)}
          </TemplateTitle>
          <TemplateContent>
            {getHighlightedText(xss(strip(template.content)), searchText)}
          </TemplateContent>
        </TemplateItem>
      ))}
    </TemplateListContainer>
  );
};

export default TemplateList;