export default function KbSkeletons({ n = 5 }: { n?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: n }).map((_, i) => {
        return (
          <div key={i} className="hover:border-theme-500 group rounded-md border border-gray-300 bg-white">
            <div className="w-full">
              <div className="flex items-center space-x-8 p-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 animate-pulse rounded-md bg-gray-300"></div>
                </div>
                <div className="flex flex-col">
                  <div className="h-4 w-32 animate-pulse rounded-md bg-gray-300 font-bold"></div>
                  <div className="mt-2 h-3 w-48 animate-pulse rounded-md bg-gray-300 text-sm"></div>
                  <div className="mt-6 flex items-center space-x-2">
                    <div className="h-4 w-16 animate-pulse rounded-md bg-gray-300 text-sm"></div>
                    <div className="text-sm text-gray-300">|</div>
                    <div className="h-4 w-48 animate-pulse rounded-md bg-gray-300 text-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
