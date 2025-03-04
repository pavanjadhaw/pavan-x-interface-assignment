"use client";
import { humanizeTimeDifference } from "@/utils/time";
import { useState, useEffect } from "react";
import { Text, TextProps } from "@mantine/core";

interface ActivityTimeProps extends TextProps {
  date: Date | string;
}

export default function ActivityTime({
  date,
  ...textProps
}: ActivityTimeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Text size="xs" color="dimmed" {...textProps}>
      {humanizeTimeDifference(date, currentTime)} ago
    </Text>
  );
}
