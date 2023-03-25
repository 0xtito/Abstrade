import React, { ChangeEvent, FunctionComponent } from 'react';

import { Container } from "./Container";



interface GroupingSelectBoxProps {
  options: number[]
}

export const GroupingSelectBox: FunctionComponent<GroupingSelectBoxProps> = ({ options }) => {
  const groupingSize: number = 3;


  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {

  };

  return (
    <div>
      <select data-testid="groupings" name="groupings" onChange={handleChange} defaultValue={groupingSize}>
        {options.map((option, idx) => <option key={idx} value={option}>Group {option}</option>)}
      </select>

    </div>
  );
};

export default GroupingSelectBox;
