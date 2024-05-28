import React, { useState } from "react";

// Define your feature components
const GrammarCheckerComponent = () => {
  return <div className="p-4">Grammar Checker Component Content</div>;
};

const SummarizerComponent = () => {
  return <div className="p-4">Summarizer Component Content</div>;
};

const PlagiarismCheckerComponent = () => {
  return <div className="p-4">Plagiarism Checker Component Content</div>;
};

// Component map
const componentMap = {
  GrammarChecker: GrammarCheckerComponent,
  Summarizer: SummarizerComponent,
  PlagiarismChecker: PlagiarismCheckerComponent,
};

const TableComponent = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature);
  };

  const SelectedComponent = selectedFeature ? componentMap[selectedFeature] : null;

  return (
    <div className="border-2 flex flex-row h-screen">
      <div className="flex flex-col border-2 w-1/2 rounded-lg">
        <div className="m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                    >
                      Features
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {Object.keys(componentMap).map((feature) => (
                    <tr
                      key={feature}
                      className="hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer"
                      onClick={() => handleFeatureClick(feature)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                        <button
                          type="button"
                          className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col border-2 w-1/2 p-4 rounded-lg">
        {SelectedComponent && <SelectedComponent />}
      </div>
    </div>
  );
};

export default TableComponent;
