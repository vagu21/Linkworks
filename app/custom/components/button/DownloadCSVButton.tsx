import { Link } from "@remix-run/react";
import DownloadCsvIcon from "~/components/ui/icons/DownloadCsvIcon";
import EntityHelper from "~/utils/helpers/EntityHelper";

interface DownloadCSVButtonProps {
  rowsData: any;
  routes?: any;
  searchParams: string;
}

export default function DownloadCSVButton({ rowsData, routes, searchParams }: DownloadCSVButtonProps) {
  if (!rowsData.pagination || rowsData.pagination.totalItems <= 0 || !routes) return null;

  return (
    <button>
      <Link
        className="flex flex-col justify-center items-center h-[35px] max-sm:h-[42px] gap-2 px-3 rounded bg-background-subtle border border-border shadow-sm"
        style={{ boxShadow: "0px 2px 0px 0 rgba(0,0,0,0.02)" }}
        to={EntityHelper.getRoutes({ routes, entity: rowsData.entity })?.export + "?" + searchParams}
        reloadDocument
      >
        <div className="flex justify-center items-center h-6 relative gap-2">
          <DownloadCsvIcon/>
          <p className="text-sm text-left text-[#000000] text-opacity-80 font-normal sm:block block">Download CSV</p>
        </div>
      </Link>
    </button>
  );
}
