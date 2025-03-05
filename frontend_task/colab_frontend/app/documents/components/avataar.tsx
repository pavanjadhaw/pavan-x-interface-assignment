import { getInitialsFromEmail } from "@/utils/utils";
import { Avatar, AvatarProps } from "@mantine/core";

interface AvataarProps extends AvatarProps {
  email: string;
}

export const Avataar = ({ email, size = "sm" }: AvataarProps) => {
  const initials = getInitialsFromEmail(email);

  return (
    <Avatar
      size={size}
      radius="xl"
      color="initials"
      variant="filled"
      name={initials}
    >
      {initials}
    </Avatar>
  );
};
