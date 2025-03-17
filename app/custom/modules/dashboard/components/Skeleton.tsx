const SkeletonDashboard = () => {
  return (
    <div className="p-6">
      <div className="mb-6 grid grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="animate-pulse rounded-xl bg-white p-6 shadow-md">
              <div className="mb-2 h-6 w-2/3 rounded-md bg-gray-300"></div>
              <div className="mb-1 h-8 w-1/3 rounded-md bg-gray-300"></div>
              <div className="h-4 w-3/4 rounded-md bg-gray-300"></div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="animate-pulse rounded-xl bg-white p-6 shadow-md">
          <div className="mb-4 h-6 w-2/3 rounded-md bg-gray-300"></div>
          <div className="h-64 w-full rounded-md bg-gray-300"></div>
        </div>

        <div className="flex animate-pulse flex-col items-center rounded-xl bg-white p-6 shadow-md">
          <div className="mb-4 h-6 w-2/3 rounded-md bg-gray-300"></div>
          <div className="h-40 w-40 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonDashboard;
