import React from 'react';
import { FolderSearch } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'Try adjusting your search or filter criteria.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-white px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F5F9] text-[#183B63]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[#172B4D]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[#64748B]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
