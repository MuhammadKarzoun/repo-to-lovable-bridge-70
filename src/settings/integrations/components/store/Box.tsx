import {
  IntegrationRow
} from '@octobots/ui-inbox/src/settings/integrations/components/store/styles';
import { ByKindTotalCount } from '@octobots/ui-inbox/src/settings/integrations/types';
import Entry from './Entry';
import Pagination from '@octobots/ui/src/components/pagination/Pagination';
import React from 'react';
import {
  Box,
  BoxName,
  GradientBox,
} from "@octobots/ui-settings/src/main/styles";
import { __ } from "coreui/utils";
import Icon from "@octobots/ui/src/components/Icon";
import colors from '@octobots/ui/src/styles/colors';
import styled, { css } from "styled-components";
import { Link } from 'react-router-dom';
// Enhanced Box with hover effects
const EnhancedBox = styled(Box)`
height:150px;
width:180px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
    .menu-item:hover{
    background-color: #f1f1f1;}
`;
// Enhanced GradientBox with modern styling
const EnhancedGradientBox = styled(GradientBox)`
  background: linear-gradient(135deg, ${colors.newPrimaryColor} 0%, ${colors.colorSecondary} 100%);
  border-radius: 12px;
  padding: 20px;
  color: ${colors.colorWhite};
  h3 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  p {
    font-size: 16px;
    line-height: 1.6;
    opacity: 0.9;
  }
`;
type Props = {
  integrations: any[];
  totalCount: ByKindTotalCount;
  queryParams: any;
  customLink: (kind: string, addLink: string) => void;
  allIntegrations: any;
  selectIntegration: any;
  selectedIntegration: any;
};
type State = {
  isContentVisible: boolean;
  kind: string | null;
  showMenu: boolean;
};
class Row extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const {
      queryParams: { kind }
    } = props;
    this.state = {
      isContentVisible: Boolean(kind) || false,
      kind,
      showMenu: false,
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
  renderBoxItem(integration) {
    const toggleMenu = () => {
      if (this.props.selectedIntegration == integration._id) {
        this.props.selectIntegration(null);
        return;
      }
      this.props.selectIntegration(integration._id);
      // this.setState({ showMenu: !this.state.showMenu })
    }
    let logos = {
      'whatsapp': '/images/integrations/whatsapp.png',
      'facebook-messenger': '/images/integrations/fb-messenger.png',
      'facebook-post': '/images/integrations/facebook.png',
      'messenger': '/images/integrations/messenger.png',
      'instagram-messenger': '/images/integrations/instagram.png',
      'instagram': '/images/integrations/instagram.png',
    }
    const { name } = integration;
    const Styleobj = { backgroundColor: '#f1b500', color: '#000', padding: '5px 20px', borderRadius: '6px', fontWeight: '600' }
    const moreBtnStyle = { position: "absolute", left: "4px", fontWeight: "bold", background: "transparent", border: "none", fontSize: "18px", top: "0px" }
    const menuStyles = {
      position: 'absolute',
      left: '8px',
      background: 'white',
      border: 'none',
      fontSize: '16px',
      top: '25px',
      borderRadius: '6px',
      zIndex: 99999,
      visibility: this.props.selectedIntegration == integration._id ? 'visible' : 'hidden', // Controls visibility
      width: '100px',
      textAlign: 'start',
      padding: '4px',
      transform: this.props.selectedIntegration == integration._id ? 'translateY(0)' : 'translateY(-6%)', // Controls initial position for animation
      transition: 'transform 0.3s ease-out', // Smooth transition for sliding effect
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)"
    };
    const menuItem = {
      display: 'flex',
      justifyContent: 'start',
      alignItems: 'center',
      gap: '4px',
      padding: '4px',
      borderRadius: '6px',
      width: '100%',
      marginBottom: '6px'
    }
    let kind = integration.kind;
    let id = integration._id;
    const editUrl = `/settings/integrations/${id}/${kind}/edit`;
    const editBtn = <Link to={`${editUrl}?kind=${kind}`}>
      <button style={{ ...Styleobj, position: 'static', fontSize: "13px" }}><Icon icon="edit" /> {" "} {__("Edit")}</button>
    </Link>;
    const menuItemComponent = (menuStyles) => {
      return (
        <div style={{ ...menuStyles }} >
          <div style={{ width: '100%', position: 'relative' }}>
            <div className='menu-item' style={{
              ...menuItem
            }}>
              <Icon icon="refresh" /> {__('Repair')}
            </div>
            <div className='menu-item' style={{
              ...menuItem
            }}>
              <Icon icon="times-circle" /> {__('Delete')}
            </div>
            <div className='menu-item' style={{
              ...menuItem
            }}>
              <Icon icon="archive-alt" />  {__('Archive')}
            </div>
          </div>
        </div>
      )
    }
    return (
      <EnhancedBox>
        {menuItemComponent(menuStyles)}
        <a
        >
          <img
            src={logos[integration.kind]}
            alt="Global Account"
          />
          <BoxName>{name}</BoxName>
          {editBtn}
          <button onClick={() => toggleMenu()} style={{ ...moreBtnStyle }}><strong>...</strong></button>
        </a>
      </EnhancedBox >
    )
  }
  render() {
    const { allIntegrations } = this.props;
    return (
      <>
        <IntegrationRow className='int-row' style={{ display: 'block', height: 'auto', margin: '10px' }}>
          {allIntegrations.map(integration =>
            this.renderBoxItem(integration)
          )}
        </IntegrationRow>
      </>
    );
  }
}
export default Row;
