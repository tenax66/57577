// https://github.com/internet-development/www-sacred

'use client';

import styles from '@/components/TableColumn.module.scss';

import * as React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  rowSpan?: number;
};

const TableColumn = ({ children, className, rowSpan }: Props) => {
  return (
    <td className={className} rowSpan={rowSpan}>
      {children}
    </td>
  );
};

TableColumn.displayName = 'TableColumn';

export default TableColumn;
