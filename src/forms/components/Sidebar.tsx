import Wrapper from "@octobots/ui/src/layout/components/Wrapper";
import React from "react";
import BrandFilter from "@octobots/ui-leads/src/containers/filters/BrandFilter";
import StatusFilter from "@octobots/ui-leads/src/containers/filters/StatusFilter";
import TagFilter from "@octobots/ui-leads/src/containers/filters/TagFilter";
import { Counts } from "@octobots/ui/src/types";
import { isEnabled } from "@octobots/ui/src/utils/core";

type Props = {
  counts: {
    byTag: Counts;
    byBrand: Counts;
    byStatus: Counts;
  };
};

function Sidebar({ counts }: Props) {
  return (
    <Wrapper.Sidebar hasBorder>
      <TagFilter counts={counts.byTag} />
      <BrandFilter counts={counts.byBrand} />
      <StatusFilter counts={counts.byStatus} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
