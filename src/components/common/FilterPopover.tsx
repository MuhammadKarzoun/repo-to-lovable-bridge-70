import React, { useState } from "react";
import styled from "styled-components";
import { Popover } from "@headlessui/react";
import Icon from "@octobots/ui/src/components/Icon";
import {
  modernColors,
  borderRadius,
  spacing,
  typography,
  transitions,
} from "../../styles/theme";

const PopoverButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: 10px 10px 8px 10px;
  background-color: ${(props) =>
    props.$isActive ? modernColors.active : modernColors.messageBackground};
  border: none;
  border-radius: ${borderRadius.md};
  color: ${(props) =>
    props.$isActive ? modernColors.primary : modernColors.textPrimary};
  //font-size: ${typography.fontSizes.sm};
  cursor: pointer;
  transition: all ${transitions.fast};
  line-height: 10px;

  &:hover {
    background-color: ${modernColors.hover};
  }

  &[aria-expanded="true"] {
    background-color: ${modernColors.active};
  }

  i {
    color: ${(props) =>
      props.$isActive ? modernColors.primary : modernColors.textPrimary};
    transition: transform ${transitions.fast};
  }

  // &[aria-expanded="true"] i {
  //   transform: rotate(180deg);
  // }
`;

const PopoverPanel = styled.div`
  position: absolute;
  //z-index: 10;
  top: 70px;
  //margin-top: ${spacing.sm};
  inset-inline-start: auto;
  background-color: ${modernColors.contentBackground};
  border-radius: ${borderRadius.md};
  box-shadow: 0 4px 12px ${modernColors.shadow};
  min-width: 330px;
  overflow: hidden;
  border: 1px solid #E5E7EB;
`;

const PopoverHeader = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  border-bottom: 1px solid ${modernColors.border};
  font-weight: ${typography.fontWeights.medium};
  color: ${modernColors.textPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PopoverContent = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: ${spacing.md};
`;

const PopoverFooter = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  border-top: 1px solid ${modernColors.border};
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.sm};
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${modernColors.textSecondary};
  font-size: ${typography.fontSizes.md};
  cursor: pointer;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  transition: all ${transitions.fast};

  &:hover {
    background-color: ${modernColors.hover};
    color: ${modernColors.textPrimary};
  }
`;

const ApplyButton = styled.button`
  background-color: ${modernColors.primary};
  border: none;
  color: white;
  font-size: ${typography.fontSizes.md};
  cursor: pointer;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  transition: all ${transitions.fast};

  &:hover {
    background-color: ${modernColors.primary}dd;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface FilterPopoverProps {
  label: string;
  icon?: string;
  isActive?: boolean;
  children: React.ReactNode;
  onClear?: () => void;
  onApply?: () => void;
  showFooter?: boolean;
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  label,
  icon,
  isActive = false,
  children,
  onClear,
  onApply,
  showFooter = true,
}) => {
  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button as={PopoverButton} $isActive={isActive || open}>
            {icon && <Icon icon={icon} />}
            {label}
            <Icon icon={open ? "angle-up" : "angle-down"} />
          </Popover.Button>

          <Popover.Panel as={PopoverPanel}>
            {({ close }) => (
              <>
                <PopoverHeader>
                  {label}
                  <Icon
                    icon="times"
                    onClick={() => close()}
                    style={{ cursor: "pointer" }}
                  />
                </PopoverHeader>

                <PopoverContent>{children}</PopoverContent>

                {showFooter && (
                  <PopoverFooter>
                    {onClear && (
                      <ClearButton
                        onClick={() => {
                          onClear();
                          close();
                        }}
                      >
                        Clear
                      </ClearButton>
                    )}
                    {onApply && (
                      <ApplyButton
                        onClick={() => {
                          onApply();
                          close();
                        }}
                      >
                        Apply
                      </ApplyButton>
                    )}
                  </PopoverFooter>
                )}
              </>
            )}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default FilterPopover;
