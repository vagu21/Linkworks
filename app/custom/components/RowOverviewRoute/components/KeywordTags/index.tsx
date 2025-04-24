import React from 'react';

const KeywordTags = ({tags}:any) => {
  const filledTags = ['Keyword 1', 'Keyword 2', 'Keyword 3'];
  const outlinedTags = [
    'gather',
    'Manager',
    'UIUX',
    'Financial Services',
    'design websites',
    'Manager',
    'Graphic Designer'
  ];

  return (
    <div className="max-w-full text-xs text-blue-950 max-md:ml-2.5">
      <div className="flex  overflow-hidden gap-2 items-center w-ful">
        {tags.map((tag:any, index:any) => (
          <span
            key={`filled-${index}`}
            className="inline-block gap-1 self-stretch px-2 py-px my-auto leading-loose rounded bg-zinc-100 text-stone-800 max-w-[100px] truncate"
          >
            {tag}
          </span>
        ))}
        {/* {outlinedTags.map((tag, index) => (
          <span
            key={`outlined-${index}`}
            className="gap-1 self-stretch px-2 py-px my-auto leading-loose whitespace-nowrap rounded border border-gray-200 border-solid bg-black bg-opacity-0"
          >
            {tag}
          </span>
        ))} */}
        {/* <span className="self-stretch my-auto font-medium text-center text-slate-700">
          +12 more
        </span>
        <span className="gap-1 self-stretch px-2 py-px my-auto leading-loose rounded border border-gray-200 border-dashed">
          New Tag
        </span> */}
      </div>
    </div>
  );
};

export default KeywordTags;