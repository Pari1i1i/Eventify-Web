import React from 'react';

export interface TableColumnHeader {
  label: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface TableProps {
  headers: (string | TableColumnHeader)[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border-3 border-neo-dark shadow-neo bg-white ${className}`}>
      <table className="w-full border-collapse font-jakarta">
        <thead>
          <tr className="bg-neo-yellow border-b-3 border-neo-dark">
            {headers.map((head, idx) => {
              const label = typeof head === 'string' ? head : head.label;
              const align = typeof head === 'string' ? 'left' : head.align || 'left';
              const extraClass = typeof head === 'string' ? '' : head.className || '';
              
              const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

              return (
                <th
                  key={idx}
                  className={`px-4 py-3.5 font-space font-extrabold text-xs uppercase tracking-wider text-neo-dark border-r-2 border-neo-dark last:border-r-0 whitespace-nowrap ${alignClass} ${extraClass}`}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-neo-dark">
          {children}
        </tbody>
      </table>
    </div>
  );
};

