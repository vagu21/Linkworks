import LoadingButton from "~/components/ui/buttons/LoadingButton";

interface FooterProps {
  isDrawer?: boolean;
  loading?: boolean;
  canUpdate?: boolean;
  submitDisabled?: boolean;
  labels?: {
    create?: string;
  };
  onSubmit: () => void;
}

const Footer = ({
  isDrawer,
  loading,
  canUpdate,
  submitDisabled,
  labels,
  onSubmit,
}: FooterProps) => {
  return (
    <div className="flex justify-between space-x-2">
      {/* Footer for Drawer */}
      {isDrawer ? (
        <div className="absolute bottom-0 top-0 left-0 right-0 bg-gray-100  rounded-t-lg shadow-lg">
          <div className="flex justify-end">
            <LoadingButton
              isLoading={loading}
              type="submit"
              disabled={loading || !canUpdate || submitDisabled}
              onClick={onSubmit}
            >
              {labels?.create ?? "Save"}
            </LoadingButton>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <LoadingButton
            isLoading={loading}
            type="submit"
            disabled={loading || !canUpdate || submitDisabled}
            onClick={onSubmit}
          >
            {labels?.create ?? "Save"}
          </LoadingButton>
        </div>
      )}
    </div>
  );
};

export default Footer;
