import { IUser } from '@octobots/ui/src/auth/types';
import Button from '@octobots/ui/src/components/Button';
import EmptyState from '@octobots/ui/src/components/EmptyState';
import { __ } from '@octobots/ui/src/utils/core';
import Sidebar from '../containers/leftSidebar/Sidebar';
import Wrapper from '@octobots/ui/src/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import { Flex } from '@octobots/ui/src/styles/main';
import { FlexBetween } from '@octobots/ui-settings/src/styles';

type Props = {
  queryParams?: any;
  currentUser: IUser;
};

function Empty({ queryParams, currentUser }: Props) {
  const menuInbox = [{ title: 'Team Inbox', link: '/inbox/index' }];

  const suggestContent = (
    <>
    <FlexBetween>

      <Link to="/settings/channels">
        <Button btnStyle="simple" icon="sitemap-1">
          {__('Manage Channels')}
        </Button>
      </Link>
      <Link to="/welcome#usingGuide" style={{
        marginLeft:'10px'
      }} >
        <Button icon="laptop-1" btnStyle='warning'>{__('Watch Tutorial')}</Button>
      </Link>
    </FlexBetween>
    </>
  );

  const content = (
    <EmptyState
      text="Whoops! No messages here but you can always start"
      size="full"
      image="/images/actions/12.svg"
      extra={suggestContent}
    />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Team Inbox')}
          queryParams={queryParams}
          submenu={menuInbox}
        />
      }
      content={content}
      leftSidebar={<Sidebar queryParams={queryParams} />}
    />
  );
}

export default Empty;
