import { BarNavItem, handleSideBarToggleArgs } from "../interfaces";

export const handleSideBarToggle = (args: handleSideBarToggleArgs) => {
  const { item, sidebarNavigation, setSidebarNavigation } = args;

  const newNav = sidebarNavigation.map((_item) => {
    _item.current = false;
    if (item.name == _item.name) _item.current = true;
    return _item;
  });
  console.log(newNav);
  // item.current = true;
  setSidebarNavigation(newNav);
};
