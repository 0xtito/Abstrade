import React, { FunctionComponent } from 'react';

import { Container } from "./styles";

interface ButtonProps {
  title: string;
  backgroundColor: string;
  callback: () => void;
}

const Button: FunctionComponent<ButtonProps> = ({ title, backgroundColor = '#5741d9', callback }) => {
  return (
    <div>
      {title}
    </div>
  );
};

export default Button;