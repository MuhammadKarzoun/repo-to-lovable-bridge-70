import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  modernColors,
  borderRadius,
  spacing,
  typography,
  transitions,
} from "../../../styles/theme";
import { __ } from "@octobots/ui/src/utils/core";
import { useLocation, useNavigate } from "react-router-dom";
import { router as routerUtils } from "@octobots/ui/src/utils";
import { IUser } from "@octobots/ui/src/auth/types";

const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  border-bottom: 1px solid ${modernColors.border};
  margin-bottom: ${spacing.md};
  width: 100%;
  max-width: 100%;
`;

const Tab = styled.div<{ $active: boolean }>`
  padding: ${spacing.sm} ${spacing.sm};
  font-size: ${typography.fontSizes.md};
  font-weight: ${(props) =>
    props.$active
      ? typography.fontWeights.bold
      : typography.fontWeights.medium};
  color: ${(props) =>
    props.$active ? modernColors.primary : modernColors.textSecondary};
  cursor: pointer;
  transition: all ${transitions.fast};
  position: relative;

  &:hover {
    color: ${modernColors.primary};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${modernColors.primary};
    opacity: ${(props) => (props.$active ? 1 : 0)};
    transition: opacity ${transitions.fast};
  }
`;

interface TabFilterProps {
  queryParams: any;
  currentUser: IUser;
  counts: any; // #TODO: add conversation counts beside the tabs, but make sure you give the correct counts based on current user filters
}

const TabFilter: React.FC<TabFilterProps> = ({
  queryParams,
  currentUser,
  counts,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    setActiveTab(queryParams.tab);
  }, [queryParams]);

  const handleTabClick = (tab: string) => {
    // Clear existing filters first
    routerUtils.removeParams(
      navigate,
      location,
      ...[
        "tab",
        "assignedUserId",
        "unassigned",
        "participating",
        "status",
        "myAssigned",
      ]
    );

    routerUtils.setParams(navigate, location, {
      tab,
      assignedUserId: tab === "myAssigned" ? currentUser._id : undefined,
      unassigned: tab === "unassigned" ? "true" : undefined,
      participating: tab === "myParticipated" ? "true" : undefined,
      status: undefined,
      myAssigned: undefined,
    });
  };

  return (
    <TabsContainer>
      <Tab $active={activeTab === "all"} onClick={() => handleTabClick("all")}>
        {__("All")}
      </Tab>
      <Tab
        $active={activeTab === "myAssigned"}
        onClick={() => handleTabClick("myAssigned")}
      >
        {__("Mine")}
      </Tab>
      <Tab
        $active={activeTab === "unassigned"}
        onClick={() => handleTabClick("unassigned")}
      >
        {__("Unassigned")}
      </Tab>
      <Tab
        $active={activeTab === "myParticipated"}
        onClick={() => handleTabClick("myParticipated")}
      >
        {__("Participated")}
      </Tab>
    </TabsContainer>
  );
};

export default TabFilter;
