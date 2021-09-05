import React, { FunctionComponent } from 'react';
import { Container } from "./styles";

interface StatusMessageProps {
  currency: string;
  isFeedKilled: boolean;
}

const StatusMessage: FunctionComponent<StatusMessageProps> = ({currency = '', isFeedKilled}) => {
  return (
    <Container>
      {isFeedKilled ? 'Feed killed.' : `Selected market: ${currency}`}
    </Container>
  );
};

export default StatusMessage;