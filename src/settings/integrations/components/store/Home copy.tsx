import {
  Content,
  FullHeight,
  IntegrationWrapper
} from '@octobots/ui-inbox/src/settings/integrations/components/store/styles';

import { ByKindTotalCount } from '@octobots/ui-inbox/src/settings/integrations/types';
import EmptyState from '@octobots/ui/src/components/EmptyState';
import HeaderDescription from '@octobots/ui/src/components/HeaderDescription';
import { INTEGRATIONS } from '@octobots/ui/src/constants/integrations';
import React from 'react';
import Box from './Box';
import Row from './Row';
import Wrapper from '@octobots/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import { Title } from '@octobots/ui-settings/src/styles';
import Icon from "@octobots/ui/src/components/Icon";
import { endianness } from 'os';
import Button from "@octobots/ui/src/components/Button";
import { BarItems } from "@octobots/ui/src/layout/styles";

type Props = {
  totalCount: ByKindTotalCount;
  queryParams: any;
  customLink: (kind: string, addLink: string) => void;
  allIntegrations: any;
};

type State = {
  searchValue: string;
  integrations: any;
  listViewMode: boolean;
  allIntegrations: any;
  selectedIntegration: any;

};

class Home extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let integrations = [...INTEGRATIONS];
    const pluginsWithIntegrations = (window as any).plugins.filter(
      plugin => plugin.inboxIntegrations
    );

    for (const p of pluginsWithIntegrations) {
      integrations = integrations.concat(p.inboxIntegrations);
    }

    this.state = {
      searchValue: '',
      integrations,
      listViewMode: false,
      allIntegrations: this.props.allIntegrations,
      selectedIntegration: null
    };
  }

  onSearch = e => {
    this.setState({ searchValue: e.target.value.toLowerCase() });
  };
  toggleDisplay = () => {
    this.setState({ listViewMode: !this.state.listViewMode })
  }

  selectIntegration(selectedIntegration) {
    this.setState({ selectedIntegration })
  }
  renderIntegrations() {
    const { integrations, searchValue, allIntegrations } = this.state;
    const { totalCount, queryParams, customLink } = this.props;

    console.log('integrations................', allIntegrations);

    const datas = [] as any;
    const rows = [...integrations];
    console.log('rows', rows);



    while (rows.length > 0) {
      datas.push(
        <Box
          key={rows.length}
          integrations={rows.splice(0, 100)}
          totalCount={totalCount}
          customLink={customLink}
          queryParams={queryParams}
          allIntegrations={allIntegrations}
          selectedIntegration={this.state.selectedIntegration}
          selectIntegration={this.selectIntegration.bind(this)}

        />
      );
    }

    if (datas.length === 0) {
      return (
        <FullHeight>
          <EmptyState
            text={`No results for "${searchValue}"`}
            image="/images/actions/2.svg"
          />
        </FullHeight>
      );
    }

    return datas;
  }



  renderIntegrationsList() {
    const { integrations, searchValue, allIntegrations } = this.state;
    const { totalCount, queryParams, customLink } = this.props;

    const datas = [] as any;
    const rows = [...integrations];

    while (rows.length > 0) {
      datas.push(
        <Row
          key={rows.length}
          integrations={rows.splice(0, 1)}
          totalCount={totalCount}
          customLink={customLink}
          queryParams={queryParams}
        />
      );
    }

    if (datas.length === 0) {
      return (
        <FullHeight>
          <EmptyState
            text={`No results for "${searchValue}"`}
            image="/images/actions/2.svg"
          />
        </FullHeight>
      );
    }

    return datas;
  }

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Integrations') }
    ];

    const headerDescription = (
      <HeaderDescription
        icon="/images/actions/33.svg"
        title="Integrations"
        description={`${__(
          'Set up your integrations and start connecting with your customers'
        )}`}
      />
    );

    return (
      <Wrapper
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__("Integrations")}</Title>
            }
            right={
              <>
                <BarItems>
                  <Button
                    onClick={() => this.toggleDisplay()}

                    btnStyle="primary" size="small" icon="eye">
                    {__("Add New")}
                  </Button>
                </BarItems>
              </>
            }
          />
        }
        header={
          <Wrapper.Header title={__('Integrations')} breadcrumb={breadcrumb} />
        }
        // mainHead={headerDescription}
        content={
          <Content >
            <IntegrationWrapper className='int-wr' style={{ minWidth: 'auto' }}>{
              this.state.listViewMode ? this.renderIntegrationsList() :
                this.renderIntegrations()

            }</IntegrationWrapper>
          </Content>
        }

      />
    );
  }
}

export default Home;
