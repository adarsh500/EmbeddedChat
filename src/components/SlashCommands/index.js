/* eslint-disable react/prop-types */
import React from 'react';
import { Options } from '@rocket.chat/fuselage';

const opts = [
  [1, 'gimme'],
  [2, 'lennyface'],
  [3, 'shrug', true],
  [4, 'me'],
];

const SlashCommands = (props) => {
  const { commands, handleSelect } = props;
  console.log(commands);

  return (
    <div>
      <Options options={opts} onSelect={handleSelect} />
    </div>
  );
};

export default SlashCommands;
