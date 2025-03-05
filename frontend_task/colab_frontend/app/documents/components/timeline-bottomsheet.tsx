import { BottomSheet } from "./bottomsheet";

interface TimelineBottomSheetProps {
  children: React.ReactNode;
}

export const TimelineBottomSheet = ({ children }: TimelineBottomSheetProps) => {
  return <BottomSheet title="Timeline">{children}</BottomSheet>;
};
