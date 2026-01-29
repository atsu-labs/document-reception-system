import { Badge } from "../ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    switch (status) {
      case '受付':
        return 'info';
      case '処理中':
        return 'warning';
      case '検査':
        return 'secondary';
      case '完了':
        return 'success';
      case 'キャンセル':
      case '却下':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant(status)}>
      {status}
    </Badge>
  );
}
