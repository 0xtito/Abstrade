import { DividerProps } from "../interfaces";

export function Divider() {
  return (
    <div className="relative py-2">
      <div
        className="inset-0 flex items-center place-content-center"
        aria-hidden="true"
      >
        <div className="w-3/4 border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-2 text-sm text-gray-500"></span>
      </div>
    </div>
  );
}
