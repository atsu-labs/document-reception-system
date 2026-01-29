import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { notificationsApi, masterApi } from '@/lib/notificationApi';
import type { Notification } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Alert } from '@/components/ui/Alert';

export default function NotificationList() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({
    status: '',
    departmentId: '',
    fromDate: '',
    toDate: '',
    keyword: '',
  });

  // Fetch notifications
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', page, limit, filters],
    queryFn: () => notificationsApi.list({ page, limit, ...filters }),
  });

  // Fetch departments for filter
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => masterApi.getDepartments(),
  });

  // Fetch notification types
  const { data: notificationTypes } = useQuery({
    queryKey: ['notificationTypes'],
    queryFn: () => masterApi.getNotificationTypes(),
  });

  // Create lookup maps
  const departmentMap = useMemo(() => {
    if (!departments) return {};
    return departments.reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {} as Record<string, string>);
  }, [departments]);

  const notificationTypeMap = useMemo(() => {
    if (!notificationTypes) return {};
    return notificationTypes.reduce((acc, type) => {
      acc[type.id] = type.name;
      return acc;
    }, {} as Record<string, string>);
  }, [notificationTypes]);

  // Define columns
  const columns = useMemo<ColumnDef<Notification>[]>(
    () => [
      {
        accessorKey: 'notificationDate',
        header: '届出日',
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return format(new Date(value), 'yyyy/MM/dd');
        },
      },
      {
        accessorKey: 'notificationTypeId',
        header: '届出種類',
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return notificationTypeMap[value] || value;
        },
      },
      {
        accessorKey: 'receivingDepartmentId',
        header: '受付所属',
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return departmentMap[value] || value;
        },
      },
      {
        accessorKey: 'processingDepartmentId',
        header: '処理所属',
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return departmentMap[value] || value;
        },
      },
      {
        accessorKey: 'propertyName',
        header: '物件名',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value || '-';
        },
      },
      {
        accessorKey: 'currentStatus',
        header: 'ステータス',
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return <StatusBadge status={value} />;
        },
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/notifications/${row.original.id}`)}
          >
            詳細
          </Button>
        ),
      },
    ],
    [departmentMap, notificationTypeMap, navigate]
  );

  // Create table instance
  const table = useReactTable({
    data: data?.items || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      departmentId: '',
      fromDate: '',
      toDate: '',
      keyword: '',
    });
    setPage(1);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          エラーが発生しました: {(error as Error).message}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">届出一覧</h1>
        <Button onClick={() => navigate('/notifications/new')}>
          新規登録
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>検索・フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">キーワード</label>
              <Input
                placeholder="物件名・内容で検索"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ステータス</label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">すべて</option>
                <option value="受付">受付</option>
                <option value="処理中">処理中</option>
                <option value="検査">検査</option>
                <option value="完了">完了</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">部門</label>
              <Select
                value={filters.departmentId}
                onChange={(e) => handleFilterChange('departmentId', e.target.value)}
              >
                <option value="">すべて</option>
                {departments?.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">開始日</label>
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">終了日</label>
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                クリア
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center py-8">
                        データがありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    {data.pagination.total > 0 
                      ? `${data.pagination.total}件中 ${((page - 1) * limit) + 1}-${Math.min(page * limit, data.pagination.total)}件を表示`
                      : '0件を表示'
                    }
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      前へ
                    </Button>
                    <span className="flex items-center px-4">
                      {page} / {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                      disabled={page === data.pagination.totalPages}
                    >
                      次へ
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
