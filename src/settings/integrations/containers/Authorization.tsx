import Spinner from '@octobots/ui/src/components/Spinner';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: fixed;
  inset-inline-start: 0;
  inset-inline-end: 0;
  top: 0;
  bottom: 0;
  background: #edf1f5;
  z-index: 100;
`;

type Props = {
  queryParams: any;
};

export const Authorization = (props: Props) => {
  const { queryParams } = props;

  if (queryParams.gmailAuthorized) {
    window.opener.location.reload();
    window.close();
  }

  return (
    <Wrapper>
      <Spinner />
    </Wrapper>
  );
};
