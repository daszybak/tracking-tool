import convertMsToTime from "@/src/utils/convertMsToTime";

const { memo, useState, useRef, useEffect } = require("react");

const ActiveStopwatch = memo(({ startTime }) => {
  const [now, setNow] = useState(new Date());
  const nowTimer = useRef(null);

  useEffect(() => {
    nowTimer.current = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      clearInterval(nowTimer.current);
    };
  }, []);

  const diff = now - new Date(startTime);
  return convertMsToTime(diff);
});

ActiveStopwatch.displayName = "ActiveStopwatch";

export default ActiveStopwatch;
