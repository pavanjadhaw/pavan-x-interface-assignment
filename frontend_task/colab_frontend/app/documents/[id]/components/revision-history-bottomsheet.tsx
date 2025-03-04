import { BottomSheet } from "@/components/bottomsheet/bottomsheet";

interface RevisionHistoryBottomSheetProps {
  children: React.ReactNode;
  title: React.ReactNode;
  onToggle?: () => void;
}

export const RevisionHistoryBottomSheet = ({
  children,
  title,
  onToggle,
}: RevisionHistoryBottomSheetProps) => {
  return (
    <BottomSheet title={title} onToggle={onToggle}>
      {children}
    </BottomSheet>
  );
};
