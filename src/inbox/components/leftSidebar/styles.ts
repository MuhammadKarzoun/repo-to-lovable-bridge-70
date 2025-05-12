import { colors, dimensions } from "@octobots/ui/src/styles";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import {
  modernColors,
  borderRadius,
  spacing,
  shadows,
  transitions,
  typography,
  zIndex,
} from "../../../styles/theme";

// Main sidebar container
const SidebarContainer = styled.div`
  display: flex;
  height: 100%;
  background-color: ${modernColors.sidebarBackground};
  border: 1px solid ${modernColors.border};
  overflow: hidden;
`;

// Sidebar navigation (left narrow sidebar)
const SidebarNav = styled.div`
  width: 72px;
  background-color: ${modernColors.sidebarDark};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing.md} 0;
  flex-shrink: 0;
  z-index: ${zIndex.docked};
`;

// Logo container at the top of the sidebar
const LogoContainer = styled.div`
  padding: ${spacing.md};
  margin-bottom: ${spacing.xl};

  img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
`;

// Navigation item in the sidebar
const NavItem = styled.div<{ $active?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing.md};
  cursor: pointer;
  position: relative;
  color: ${(props) =>
    props.$active ? modernColors.sidebarText : modernColors.sidebarTextMuted};
  background-color: ${(props) =>
    props.$active ? modernColors.sidebarItemActive : "transparent"};
  transition: all ${transitions.fast};

  &:hover {
    background-color: ${modernColors.sidebarItemHover};
    color: ${modernColors.sidebarText};
  }

  &::after {
    content: "";
    position: absolute;
    left: -${spacing.md};
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 24px;
    background-color: ${modernColors.primary};
    border-radius: 0 ${borderRadius.sm} ${borderRadius.sm} 0;
    opacity: ${(props) => (props.$active ? 1 : 0)};
    transition: opacity ${transitions.fast};
  }

  i {
    font-size: 20px;
  }
`;

// Badge for notification counts
const NavBadge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  border-radius: ${borderRadius.pill};
  background-color: ${modernColors.danger};
  color: white;
  font-size: ${typography.fontSizes.xs};
  font-weight: ${typography.fontWeights.semibold};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${spacing.xs};
`;

// Main content area of the sidebar
const SidebarContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 340px;
`;

// Header of the sidebar content
const SidebarHeader = styled.div`
  padding: ${spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${modernColors.border};
`;

// Title in the sidebar header
const SidebarTitle = styled.h2`
  font-size: ${typography.fontSizes.lg};
  font-weight: ${typography.fontWeights.semibold};
  color: ${modernColors.textPrimary};
`;

// Actions container in the sidebar header
const SidebarActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};

  .date-popover {
    max-width: 470px;
    width: 500px;
  }

  .rdtPicker {
    width: 100%;
  }
`;

// Search input in the sidebar
const SearchInput = styled.div`
  position: relative;
  margin: ${spacing.md} 0;
  width: 100%;

  input {
    width: 100%;
    padding: ${spacing.sm} ${spacing.md} ${spacing.sm} 40px;
    border: 1px solid ${modernColors.border};
    border-radius: ${borderRadius.md};
    font-size: ${typography.fontSizes.md};
    line-height: ${typography.fontSizes.md};
    background-color: ${modernColors.background};
    transition: all ${transitions.fast};

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

// Filter bar below search
const FilterBar = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${spacing.md};
  margin-bottom: ${spacing.md};
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 0;
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

// Filter item in the filter bar
const FilterItem = styled.div<{ $active?: boolean }>`
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.pill};
  font-size: ${typography.fontSizes.sm};
  font-weight: ${typography.fontWeights.medium};
  white-space: nowrap;
  cursor: pointer;
  background-color: ${(props) =>
    props.$active ? modernColors.primary : modernColors.messageBackground};
  color: ${(props) => (props.$active ? "white" : modernColors.textSecondary)};
  transition: all ${transitions.fast};
  margin-right: ${spacing.sm};

  &:hover {
    background-color: ${(props) =>
      props.$active ? modernColors.primary : modernColors.hover};
  }
`;

// Conversation list container
const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 ${spacing.md};
`;

// Conversation items list
const ConversationItems = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

// Checkbox for conversation selection
const CheckBox = styled.div`
  position: absolute;
  inset-inline-start: .7rem;
  top: 1.1rem;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity ${transitions.fast};
  z-index: 1;
`;

// Conversation item row content
const RowContent = styledTS<{ $isChecked?: boolean }>(styled.div)`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  // padding-left: ${(props) => (props.$isChecked ? "40px" : "0")};
  transition: padding ${transitions.fast};
  
  ${CheckBox} {
    opacity: ${(props) => (props.$isChecked ? 1 : 0)};
  }
`;

// Flex content container
const FlexContent = styled.div`
  width: 100%;

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: ${spacing.xs};
    margin-top: ${spacing.xs};

    > span {
      margin-right: ${spacing.xs};
    }
  }
`;

// Main info section of conversation item
const MainInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  margin-bottom: ${spacing.xs};
`;

// Customer info container
const CustomerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

// Message count badge
const Count = styled.div`
  min-width: 20px;
  height: 20px;
  padding: 0 ${spacing.xs};
  background-color: ${modernColors.primary};
  color: white;
  border-radius: ${borderRadius.pill};
  font-size: ${typography.fontSizes.xs};
  font-weight: ${typography.fontWeights.semibold};
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Small text with ellipsis
const SmallTextOneLine = styled.div`
  color: ${modernColors.textSecondary};
  font-size: ${typography.fontSizes.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Message content preview
const MessageContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${spacing.xs};
`;

// Message preview text
const MessagePreview = styled.div`
  color: ${modernColors.textSecondary};
  font-size: ${typography.fontSizes.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`;

// Conversation item
const RowItem = styledTS<{
  $isActive?: boolean;
  $isRead?: boolean;
}>(styled.li)`
  position: relative;
  padding: ${spacing.md};
  margin-bottom: ${spacing.sm};
  border-radius: ${borderRadius.lg};
  background-color: ${(props) =>
    props.$isActive
      ? modernColors.active
      : props.$isRead
        ? modernColors.contentBackground
        : modernColors.unread};
  cursor: pointer;
  transition: all ${transitions.fast};
  box-shadow: ${(props) => (props.$isActive ? shadows.md : "none")};
  
  ${(props) =>
    !props.$isRead &&
    `
    border-left: 3px solid ${modernColors.primary};
  `}
  
  &:hover {
    background-color: ${(props) => (props.$isActive ? modernColors.active : modernColors.hover)};
    
    ${CheckBox} {
      opacity: 1;
    }
  }
`;

// Idle indicator
const Idle = styled.div`
  padding-left: .5rem;
  padding-right: .5rem;
  height: 1.25rem;
  border-radius: .25rem;
  border: 1px solid #e5e7eb;
  background : #FFF;

  span {
    color: #ca244d;
    font-size: ${typography.fontSizes.xs};
    font-weight: ${typography.fontWeights.semibold};
  }
`;

// Assignee image
const AssigneeImg = styled.div`
  width: 24px;
  height: 24px;
  border-radius: ${borderRadius.circle};
  overflow: hidden;
  margin-left: ${spacing.xs};
  border: 2px solid ${modernColors.contentBackground};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Assignees container
const AssigneesContainer = styled.div`
  display: flex;
  align-items: center;
`;

// Left content container
const LeftContent = styledTS<{ $isOpen?: boolean }>(styled.div)`
  display: flex;
  height: 100%;
  transition: all ${transitions.normal};
  width:100%;
  padding-inline:4px;
`;

// Additional sidebar (filters)
const AdditionalSidebar = styled.div`
  width: 200px;
  background-color: ${modernColors.sidebarBackground};
  // border-right: 1px solid ${modernColors.border};
  overflow-y: auto;
  transition: all ${transitions.normal};
  padding: ${spacing.lg} 0;
  border-inline-end: 1px solid #E5E7EB;
  margin-inline-end: 4px;
`;

// Dropdown wrapper
const DropdownWrapper = styled.div`
  display: flex;
  gap: ${spacing.sm};
`;

// Toggle button
const ToggleButton = styledTS<{ $isActive?: boolean }>(styled.button)`
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.$isActive ? modernColors.primary : modernColors.textSecondary)};
  background-color: ${(props) => (props.$isActive ? modernColors.active : "transparent")};
  cursor: pointer;
  transition: all ${transitions.fast};
  
  &:hover {
    background-color: ${modernColors.hover};
    color: ${modernColors.textPrimary};
  }
`;

// Group title in filters
const GroupTitle = styledTS<{ $isOpen?: boolean }>(styled.div)`
  font-weight: ${typography.fontWeights.medium};
  padding: ${spacing.md} ${spacing.lg};
  color: ${(props) => (props.$isOpen ? modernColors.primary : modernColors.textPrimary)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all ${transitions.fast};
  
  &:hover {
    background-color: ${modernColors.hover};
  }
  
  span i {
    margin-left: ${spacing.xs};
    transition: transform ${transitions.fast};
    transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0)")};
  }
  
  a {
    color: ${modernColors.textSecondary};
    
    &:hover {
      color: ${modernColors.primary};
    }
  }
`;

// Filter group content
const GroupContent = styled.div<{ $isOpen?: boolean }>`
  max-height: ${(props) => (props.$isOpen ? "500px" : "0")};
  overflow: hidden;
  transition: max-height ${transitions.normal};
`;

// // Filter item
// const FilterItem = styled.div<{ $active?: boolean }>`
//   padding: ${spacing.sm} ${spacing.lg} ${spacing.sm} ${spacing.xl};
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   cursor: pointer;
//   color: ${props => props.$active ? modernColors.primary : modernColors.textSecondary};
//   background-color: ${props => props.$active ? modernColors.active : 'transparent'};
//   transition: all ${transitions.fast};

//   &:hover {
//     background-color: ${modernColors.hover};
//     color: ${modernColors.textPrimary};
//   }
// `;

// Right items container
const RightItems = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

// Scroll content
const ScrollContent = styled.div`
  flex: 1;
  overflow: auto;
`;

export {
  SidebarContainer,
  SidebarNav,
  LogoContainer,
  NavItem,
  NavBadge,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarActions,
  SearchInput,
  FilterBar,
  FilterItem,
  ConversationList,
  ConversationItems,
  CheckBox,
  RowContent,
  FlexContent,
  MainInfo,
  CustomerInfo,
  Count,
  SmallTextOneLine,
  MessageContent,
  MessagePreview,
  RowItem,
  Idle,
  AssigneeImg,
  AssigneesContainer,
  LeftContent,
  AdditionalSidebar,
  DropdownWrapper,
  ToggleButton,
  GroupTitle,
  GroupContent,
  RightItems,
  ScrollContent,
};
