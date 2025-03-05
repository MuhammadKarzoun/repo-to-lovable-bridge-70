import {
  CollapsibleContent,
  IntegrationRow
} from '@octobots/ui-inbox/src/settings/integrations/components/store/styles';

import { ByKindTotalCount } from '@octobots/ui-inbox/src/settings/integrations/types';
import Collapse from '@octobots/ui/src/components/Collapse';
import Entry from './Entry';
import IntegrationListCard from '@octobots/ui-inbox/src/settings/integrations/containers/common/IntegrationListCard';
import Pagination from '@octobots/ui/src/components/pagination/Pagination';
import React from 'react';

type Props = {
  integrations: any[];
  totalCount: ByKindTotalCount;
  queryParams: any;
  rows:any[];
  customLink: (kind: string, addLink: string) => void;
};

type State = {
  isContentVisible: boolean;
  kind: string | null;
};

class RowCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const {
      queryParams: { kind },
      rows
    } = props;

    this.state = {
      isContentVisible: Boolean(kind) || false,
      kind
    };
  }

  getClassName = selectedKind => {
    const { kind, isContentVisible } = this.state;

    if (!isContentVisible) {
      return '';
    }

    if (selectedKind === kind) {
      return 'active';
    }

    return '';
  };

  toggleBox = (selectedKind: string, isAvailable?: boolean) => {
    if (isAvailable && !isAvailable) return null;

    if (!selectedKind || selectedKind === 'amazon-ses') {
      return false;
    }
  
    const { isContentVisible, kind } = this.state;
  
    this.setState(prevState => {
      if (
        prevState.kind === selectedKind ||
        kind === null ||
        !isContentVisible
      ) {
        return { isContentVisible: !isContentVisible, kind: selectedKind };
      }
  
      return {
        kind: selectedKind,
        isContentVisible: prevState.isContentVisible
      };
    });
  
    return null;
  };
  

  renderPagination(totalCount) {
    if (!totalCount || totalCount <= 20) {
      return null;
    }

    return <Pagination count={totalCount} />;
  }

  renderEntry(integration, totalCount, queryParams) {
    const commonProp = {
      key: integration.name,
      integration,
      toggleBox: this.toggleBox,
      getClassName: this.getClassName,
      totalCount,
      queryParams
    };

    return <Entry {...commonProp} />;
  }

  renderList() {
    const { queryParams, totalCount } = this.props;
    const { kind } = this.state;
    
    
    return (
      <>
        <IntegrationListCard
          kind={kind}
          rows={this.props.rows}
          queryParams={queryParams}
          integrationsCount={totalCount[kind || '']}
        />
        {this.renderPagination(totalCount[kind || ''])}
      </>
    );
  }

  render() {
    const { integrations, totalCount, queryParams,rows } = this.props;
    
    return (
      <>
      {this.renderList()}
      </>
    );
  }
}

export default RowCard;
