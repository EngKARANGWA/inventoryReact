import React from "react";
import { FileX2 } from "lucide-react";

interface Props {
  message?: string;
}

const SmallExpenseEmptyState: React.FC<Props> = ({ message = "No small expenses found." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500 dark:text-gray-400">
      <FileX2 size={48} className="mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  );
};

export default SmallExpenseEmptyState;
