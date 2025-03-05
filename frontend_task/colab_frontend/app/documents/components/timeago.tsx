"use client";
import { humanizeTimeDifference } from "@/utils/time";
import { useState, useEffect } from "react";
import { Text, TextProps } from "@mantine/core";

interface TimeAgoProps extends TextProps {
  date: Date | string;
}

export const TimeAgo = ({ date, ...textProps }: TimeAgoProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Text {...textProps}>{humanizeTimeDifference(date, currentTime)} ago</Text>
  );
};
