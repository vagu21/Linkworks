import React from "react";

interface EntityPreviewProps {
  title: string | null;
  subtitle: string | null;
  details: string[];
}

const EntityPreview: React.FC<EntityPreviewProps> = ({ title, subtitle, details }) => {
  return (
    <article className="bg-surface-tertiary border-border flex w-full flex-col items-start justify-center gap-2.5 rounded-lg border p-3">
      <div className="flex w-full items-start justify-between">
        <div className="flex flex-col items-start gap-3">
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-headings text-sm font-bold leading-5">{title}</h3>
              <p className="text-headings gap-2 text-sm">{subtitle}</p>
            </div>
            <div className="text-headings flex items-center text-xs flex-wrap gap-2">
              {details.map((currDetail, index) => {
                return (
                  <React.Fragment key={currDetail + "-" + index}>
                    {index != 0 && (
                        <div className="bg-[#121212] h-1 w-1 rounded-full"></div>
                    )}
                    <span className="">{currDetail}</span>{" "}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default EntityPreview;
