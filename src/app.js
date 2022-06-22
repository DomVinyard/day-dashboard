import React, { useEffect, useState } from "react";
import { Flex, Box, Text, Center } from "@chakra-ui/react";
import useInterval from "use-interval";
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { DateTime } from "luxon";
import "./app.css";

// Casablanca
const longitude = 33.5731;
const latitude = 7.5898;

const LATE_STARTS_AT = 23;
const SUNRISESET_MINS = 120;
const VERY_LATE_STARTS_AT = 2;
const LUNCH_STARTS_AT = 12;
const LUNCH_ENDS_AT = 14;

Number.prototype.round = function (places) {
  return +(Math.round(this + "e+" + places) + "e-" + places);
};

const formatDate = (date) => DateTime.fromJSDate(date);

export default function App() {
  const [message, setMessage] = useState();
  const [now, setNow] = useState(DateTime.now());
  // const [day, setDay] = useState();
  const [clock, setClock] = useState();
  useInterval(() => setNow(DateTime.now()), 500);
  useEffect(() => {
    const sunrise = formatDate(getSunrise(latitude, longitude));
    const sunset = formatDate(getSunset(latitude, longitude));
    const isBeforeSunrise = now < sunrise;
    const buildClock = () => {
      const timestampsAbsolute = Object.entries({
        now,
        sunrise: sunrise,
        morning: sunrise.plus({ minutes: SUNRISESET_MINS / 2 }),
        lunch: now.set({ hour: LUNCH_STARTS_AT, minute: 0 }),
        afternoon: now.set({ hour: LUNCH_ENDS_AT, minute: 0 }),
        evening: sunset.plus(2, "hours"),
        late: now.set({ hour: LATE_STARTS_AT, minute: 0 }),
        veryLate: now
          .set({ hour: VERY_LATE_STARTS_AT, minute: 0 })
          .plus({ day: 1 }),
        nextSunrise: sunrise.plus({ day: 1 }),
      }).reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: value
            .minus({ day: now < sunrise && key != "now" ? 1 : 0 })
            .toMillis(),
        };
      }, {});

      const timestampsRatio = Object.entries(timestampsAbsolute).reduce(
        (acc, [key, value]) => {
          return {
            ...acc,
            [key]: (
              (value - timestampsAbsolute.sunrise) /
              (timestampsAbsolute.nextSunrise - timestampsAbsolute.sunrise)
            ).round(3),
          };
        },
        {}
      );

      return { ...timestampsRatio };
    };
    const generateMessage = () => {
      const prevDayName = now.minus(1, "day").weekdayLong;
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
      const beforeEvening = now < sunset.minus(1, "hour");
      if (beforeEvening) return `${now.weekdayLong} afternoon`;
      const isEvening = now < sunset.plus(2, "hours");
      if (isEvening) return `${now.weekdayLong} evening`;
      return `${now.weekdayLong} night`;
    };
    setClock(buildClock());
    setMessage(`It's ${generateMessage()}`);
  }, [now]);
  // console.log(clock);
  if (!clock) return "loading";
  const phases = [
    { key: "sunrise", color: "#E8B562" },
    { key: "morning", color: "#F8E16A" },
    { key: "lunch", color: "#FAFBC3" },
    { key: "afternoon", color: "#B0CADD" },
    {
      key: "evening",
      color: "#6793B4",
    },
    {
      key: "late",
      color: "#254885",
    },
    {
      key: "veryLate",
      color: "#112A74",
    },
    { key: "nextSunrise" },
  ];
  const height = 28;
  return (
    <Center width="full" height="100vh" flexDirection="column">
      <Flex
        // opacity="0.3"
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
      <Box w={"90%"} maxW="400px" mt={4}>
        <Flex h={`${height}px`}>
          {phases.map((phase, i) => {
            if (!phases[i + 1]) return null;
            const starts = clock[phase.key];
            const ends = clock[phases[i + 1].key];
            const percent = (ends - starts) * 100;
            return (
              <Box
                // bgPos={"center center"}
                // bgSize="cover"
                // bgImg={`url(${phase.image})`}
                mr={"1px"}
                bg={phase.color}
                width={`${percent}%`}
              >
                {/* {phase} starts: {starts} ends: {ends} */}
              </Box>
            );
          })}
        </Flex>
        <Flex
          mt={`-${height}px`}
          // bg={"white"}
          position="relative"
          zIndex={2}
          borderRight={"3px solid red"}
          // opacity={now.millisecond < 500 ? 1 : 0.8}
          w={`${clock.now * 100}%`}
          // w={"100%"}
          h={`${height}px`}
        ></Flex>
      </Box>
    </Center>
  );
}
