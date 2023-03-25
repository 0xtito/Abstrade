import React, { FunctionComponent } from 'react';

import { Container } from "./styles";


interface PriceLevelRowProps {
  total: string;
  size: string;
  price: string;
  reversedFieldsOrder: boolean;
  windowWidth: number;
}

const PriceLevelRow: FunctionComponent<PriceLevelRowProps> = ({
  total,
  size,
  price,
  reversedFieldsOrder = false,
  windowWidth
}) => {
  return (
    <div data-testid='price-level-row' >

    </div >
  );
};

export default PriceLevelRow;
