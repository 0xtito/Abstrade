interface DividerProps {
  Icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Divider(props: DividerProps) {
  const { Icon, setSidebarExpanded } = props;

  return (
    // <div className="relative py-2">
    //   <div
    //     className="inset-0 flex items-center place-content-center"
    //     aria-hidden="true"
    //   >
    //     <div className="w-3/4 border-t border-gray-300" />
    //   </div>
    //   <div className="relative flex justify-center">
    //     <span className="bg-white px-2 text-sm text-gray-500"></span>
    //     <button
    //       type="button"
    //       className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-1.5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    //     >
    //       <Icon
    //         className="relative -ml-1 -mr-0.5 h-5 w-5 text-gray-400"
    //         aria-hidden="true"
    //       />
    //     </button>
    //   </div>
    // </div>
    <div className="relative py-2 flex items-center pl-5">
      <div className="inline-flex w-3/4  border-t border-gray-300" />
      <div className="relative flex items-end">
        <button
          type="button"
          className="inline-flex gap-x-1.5 rounded-full bg-white px-1.5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ml-4"
        >
          <Icon
            className="relative -ml-1 -mr-0.5 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
