import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import PencilIcon from "~/components/ui/icons/PencilIcon";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import { Graph_List } from "~/custom/modules/graphs/routes/api/graphRoutes.New.Api";
import { LoaderData } from "~/routes/app.$tenant/g.$group";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmMessage: string;
}

const GraphCard = ({ config, onEdit, onDelete }: any) => {
  return (
    <div className="flex w-full items-center justify-end rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="w-3/12 overflow-hidden truncate whitespace-nowrap text-base font-bold text-gray-700">{config.visualizationType.toUpperCase()}</div>
      <div className="w-8/12 overflow-hidden truncate whitespace-nowrap text-sm font-semibold text-gray-800">
        <div>{config.title}</div>
        <div className="mt-2 font-normal">{config.description}</div>
      </div>
      <div className="flex w-1/12 md:gap-2 xl:gap-4">
        <button className="rounded p-1 text-white hover:bg-gray-100" onClick={() => onEdit(config)}>
          <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
        </button>
        <button className="rounded p-1 text-white hover:bg-gray-100" onClick={() => onDelete(config)}>
          <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export const loader = (args: LoaderFunctionArgs) => Graph_List.loader(args);
export const action: ActionFunction = (args) => Graph_List.action(args);

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message, confirmMessage }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <div>
          <div className="mb-4 flex gap-2">
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.0007 3.40825L16.2757 14.2499H3.72565L10.0007 3.40825ZM10.0007 0.083252L0.833984 15.9166H19.1673L10.0007 0.083252ZM10.834 11.7499H9.16732V13.4166H10.834V11.7499ZM10.834 6.74992H9.16732V10.0833H10.834V6.74992Z"
                fill="#FE2424"
              />
            </svg>
            <div className="text-base font-semibold text-red-600">Delete Graph</div>
          </div>
          <p className="mb-4 text-base text-gray-800">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button className="rounded-lg border border-[#D9D9D9] bg-white px-3 py-1 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white" onClick={onConfirm}>
            {confirmMessage}
          </button>
        </div>
      </div>
    </div>
  );
};

const Graphs = () => {
  const data: any = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const chartConfigs = data?.chartconfigs || [];
  const [selectedChart, setSelectedChart] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [chartToDelete, setChartToDelete] = useState<any>(null);
  let isDelete = "false";

  const handleEdit = (chart: any) => {
    setSelectedChart(chart);
  };

  const handleDelete = (chart: any) => {
    setChartToDelete(chart);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (chartToDelete) {
      try {
        isDelete = "true";
        const formData = new FormData();
        formData.append("id", chartToDelete.id);
        formData.append("isDelete", isDelete);
        submit(formData, {
          method: "post",
        });
        setShowModal(false);
        setChartToDelete(null);
        isDelete = "false";
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }
  };

  const handleNavigate = () => {
    setSelectedChart(null);
    navigate("/admin/entities/graph", { state: { selectedChart } });
  };

  useEffect(() => {
    if (selectedChart) {
      navigate("/admin/entities/graph", { state: { selectedChart } });
    }
  }, [navigate, selectedChart]);

  return (
    <div className="p-8">
      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Chart Configurations</h2>
        <button className="self-end rounded-lg bg-black px-4 py-2 font-bold text-white" onClick={handleNavigate}>
          New
        </button>
      </div>
      <div className="space-y-2 py-4">
        {chartConfigs.map((config: any) => (
          <GraphCard key={config.id} config={config} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDelete}
        message={`Are you sure, you want to delete ${chartToDelete?.title} chart? This action cannot be undone.`}
        confirmMessage="Delete"
      />
    </div>
  );
};

export default Graphs;
