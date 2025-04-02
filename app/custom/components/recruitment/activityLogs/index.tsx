import Activities from "./activities";

export default function activityLogs({ rowData, options, onSubmit }: any) {
  return (
    <>
      {rowData.entity.hasActivity && rowData.rowPermissions.canComment && !options?.hideActivity && (
        <>
          <Activities items={rowData.logs} onSubmit={onSubmit} hasComments={rowData.entity.hasComments} />
        </>
      )}
    </>
  );
}
