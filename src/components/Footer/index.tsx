import React, { FunctionComponent } from 'react';

import { Container } from "./styles";
import Button from "../Button";

interface FooterProps {
  //toggleFeedCallback: () => void;
  toggleFeedCallback: any;
  killFeedCallback: () => void;
  isFeedKilled: boolean;
}

const Footer: FunctionComponent<FooterProps> = ({ toggleFeedCallback, killFeedCallback, isFeedKilled }) => {
  return (
    <Container>
      {!isFeedKilled && <Button title={'xDAI_WETH'} backgroundColor={'#5741d9'} callback={() => toggleFeedCallback('xDAI_WETH')} />}
      {!isFeedKilled && <Button title={'xDAI_WBTC'} backgroundColor={'#5741d9'} callback={() => toggleFeedCallback('xDAI_WBTC')} />}
      {!isFeedKilled && <Button title={'xDAI_GNO'} backgroundColor={'#5741d9'} callback={() => toggleFeedCallback('xDAI_GNO')} />}
      <Button title={isFeedKilled ? 'Renew feed' : 'Kill Feed'} backgroundColor={'#b91d1d'} callback={killFeedCallback} />
    </Container>
  );
};

export default Footer;