import React, { useEffect, useState } from "react";
import { Flex, Box, Text, Center } from "@chakra-ui/react";
import useInterval from "use-interval";
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { DateTime } from "luxon";
import "./app.css";

// Casablanca
const longitude = 33.5731;
const latitude = 7.5898;

const LATE_STARTS_AT = 0;
const SUNRISESET_MINS = 60;
const VERY_LATE_STARTS_AT = 2;
const LUNCH_STARTS_AT = 12;
const LUNCH_ENDS_AT = 14;

const formatDate = (date) => DateTime.fromJSDate(date);
export default function App() {
  const [message, setMessage] = useState();
  const [now, setNow] = useState(DateTime.now());
  useInterval(() => setNow(DateTime.now()), 500);
  useEffect(() => {
    const generateMessage = (latitude, longitude) => {
      const prevDayName = now.minus(1, "day").weekdayLong;
      const sunrise = formatDate(getSunrise(latitude, longitude));
      const isBeforeSunrise = now < sunrise;
      if (isBeforeSunrise) {
        const sunriseMins = Math.abs(now.diff(sunrise, "minutes").minutes);
        if (sunriseMins < SUNRISESET_MINS / 2)
          return `sunrise on ${prevDayName}`;
        else if (now.hour >= VERY_LATE_STARTS_AT)
          return `very late ${prevDayName} night`;
        else if (now.hour >= LATE_STARTS_AT) return `late ${prevDayName} night`;
        else return `${prevDayName} night`;
      }
      const isLunchTime =
        now.hour >= LUNCH_STARTS_AT && now.hour < LUNCH_ENDS_AT;
      if (isLunchTime) return `${now.weekdayLong} lunchtime 🍽`;
      const isBeforeLunch = now.hour < LUNCH_STARTS_AT;
      if (isBeforeLunch) return `${now.weekdayLong} morning`;
      const sunset = formatDate(getSunset(latitude, longitude));
      const beforeEvening = now < sunset.minus(1, "hour");
      if (beforeEvening) return `${now.weekdayLong} afternoon`;
      const isEvening = now < sunset.plus(2, "hours");
      if (isEvening) return `${now.weekdayLong} evening`;
      return `${now.weekdayLong} night`;
    };
    setMessage(`It's ${generateMessage(longitude, latitude)}`);
  }, [now]);
  return (
    <Center width="full" height="100vh" flexDirection="column">
      <Flex
        opacity="0.3"
        fontSize="60px"
        fontWeight="black"
        flexDirection="row"
        lineHeight={"4rem"}
      >
        {now.hour}
        <Text opacity={now.millisecond < 500 ? 0.8 : 0.7}>:</Text>
        {`${now.minute}`.padStart(2, "0")}
      </Flex>
      <Box>
        <Text>{message || "loading"}</Text>
      </Box>
    </Center>
  );
}
