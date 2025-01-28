

const SkeletonDashboard = () => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array(4).fill(0).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-6 w-2/3 bg-gray-300 rounded-md mb-2"></div>
            <div className="h-8 w-1/3 bg-gray-300 rounded-md mb-1"></div>
            <div className="h-4 w-3/4 bg-gray-300 rounded-md"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="h-6 w-2/3 bg-gray-300 rounded-md mb-4"></div>
          <div className="h-64 w-full bg-gray-300 rounded-md"></div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse flex flex-col items-center">
          <div className="h-6 w-2/3 bg-gray-300 rounded-md mb-4"></div>
          <div className="h-40 w-40 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonDashboard;
