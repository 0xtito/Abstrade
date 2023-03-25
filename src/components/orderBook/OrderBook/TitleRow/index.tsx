import React, { FunctionComponent } from 'react';
import { Container } from "./styles";

interface TitleRowProps {
  reversedFieldsOrder?: boolean;
  windowWidth: number;
}

const TitleRow: FunctionComponent<TitleRowProps> = ({ reversedFieldsOrder = false, windowWidth }) => {
  return (
    <div data-testid='title-row'>

    </div>
  );
};

export default TitleRow;
