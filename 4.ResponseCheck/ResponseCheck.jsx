import React, { useRef, useState } from "react";

const ResponseCheck = () => {
  const [state, setState] = useState("wating");
  const [message, setMessage] = useState("클릭해서 시작하세요.");
  const [result, setResult] = useState([]);

  const timeOut = useRef(null);
  const startTime = useRef(null);
  const endTime = useRef(null);

  const onClickScreen = () => {
    if (state === "wating") {
      setState("ready");
      setMessage("초록색이 되면 클릭하세요.");
      timeOut.current = setTimeout(() => {
        setState("now");
        setMessage("지금 클릭!!!!");
        startTime.current = new Date();
      }, Math.floor(Math.random() * 1000) + 2000);
    } else if (state === "ready") {
      clearTimeout(timeOut.current);
      setState("wating");
      setMessage("너무 성급하시군요! 초록색이 된 후에 클릭하세요");
    } else if (state === "now") {
      endTime.current = new Date();
      setState("wating");
      setMessage("클릭해서 시작하세요.");
      setResult((prevResult) => {
        return [...prevResult, endTime.current - startTime.current];
      });
    }
  };
  const onReset = () => {
    setResult([]);
  };

  const renderAverage = () => {
    return result.length === 0 ? null : (
      <>
        <div>평균 시간: {result.reduce((a, c) => a + c) / result.length}ms</div>
        <button onClick={onReset}>리셋</button>
      </>
    );
  };

  return (
    <>
      <div id="screen" className={state} onClick={onClickScreen}>
        {message}
      </div>
      {renderAverage()}
    </>
  );
};

export default ResponseCheck;
