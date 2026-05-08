// BulkAction.jsx
import Dropdown from "./Dropdown";
import { FaChevronDown } from "react-icons/fa";
import { hasPermission } from "../../utils/hasPermission";

export default function BulkAction({
  list,
  handleBulkDelete = () => {},
  openBulkStatusModal = () => {},
}) {
  // Fallback default list if `list` prop is not provided
  const baseItems =
    list && list.length > 0
      ? list
      : [
          {
            title: "Bulk Delete",
            onClick: () => handleBulkDelete(),
          },
          {
            title: "Change Status (Bulk)",
            onClick: () => openBulkStatusModal(),
          },
        ];

  // Only keep items the user has permission for
  // const itemsWithPermission = baseItems.filter((item) => {
  //   if (!item.api) return false; // must have api to check
  //   const method = item.method || "GET";
  //   return hasPermission(item.api, method);
  // });

  // If user has no permission for any bulk action -> render nothing
  // if (itemsWithPermission.length === 0) {
  //   return null;
  // }

  return (
    <Dropdown
      button={
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded hover:bg-gray-50">
          Bulk Actions <FaChevronDown />
        </button>
      }
      align="left"
    >
      {({ close }) => (
        <div className="py-1">
          {list.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                close();
                item.onClick && item.onClick(item);
              }}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100"
            >
              {item.title}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  );
}
