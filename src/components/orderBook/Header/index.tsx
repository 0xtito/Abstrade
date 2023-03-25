import React, { FunctionComponent } from 'react';

import { Container } from "./styles";
import GroupingSelectBox from "../GroupingSelectBox";

interface HeaderProps {
  options: number[];
}

const Header: FunctionComponent<HeaderProps> = ({ options }) => {
  return (
    <div>
      <h3>Order Book</h3>
      <GroupingSelectBox options={options} />
    </div>
  );
};

export default Header;
