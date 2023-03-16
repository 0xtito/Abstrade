import { IconProp } from "../../../interfaces";

export function MetamaskIcon(props: IconProp) {
  const { className } = props;
  return (
    <img
      className={className}
      aria-hidden="true"
      width="24"
      height="24"
      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
    />
  );
}
