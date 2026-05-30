const TableSkeleton = () => {
  const skeletonRows = [1, 2, 3, 4, 5]; 

  return (
    <>
      {skeletonRows.map((index) => (
        <tr key={index} className="border-b border-gray-100 animate-pulse">
          <td className="p-4">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="p-4">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </td>
          <td className="p-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </td>
          <td className="p-4 text-right">
            <div className="h-8 bg-blue-200 rounded w-24 ml-auto"></div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;