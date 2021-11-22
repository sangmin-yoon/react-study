import React, { useEffect, useRef, useState } from "react";
const rspCoords = {
  바위: "0",
  가위: "-142px",
  보: "-284px",
};

const scores = {
  가위: 1,
  바위: 0,
  보: -1,
};

//Object.entries(rspCoords) = [["바위", 0],["가위", 142px],["보", -284px]]
const computerChoice = (imgCoord) => {
  // ex) imgCoord = -142px
  return Object.entries(rspCoords).find(function (v) {
    return v[1] === imgCoord; // rspCoores의 각각 픽셀에서 인자로 받은 imgCoord의 픽셀과 같은값을 찾아서 반환
    // ex) ["가위", 142px] 반환한다.
  })[0]; // 그값의 0번째 index = "가위"
};

const RSP = () => {
  const [result, setResult] = useState("");
  const [imgCoord, setImgCoord] = useState(rspCoords.바위);
  const [score, setScore] = useState(0);
  const interval = useRef();

  const changedHand = () => {
    if (imgCoord === rspCoords.바위) {
      setImgCoord(rspCoords.가위);
    } else if (imgCoord === rspCoords.가위) {
      setImgCoord(rspCoords.보);
    } else if (imgCoord === rspCoords.보) {
      setImgCoord(rspCoords.바위);
    }
  };

  useEffect(() => {
    interval.current = setInterval(changedHand, 50);
    return () => {
      clearInterval(interval.current);
    };
  }, [imgCoord]);

  const onClickBtn = (choice) => () => {
    // choice = 내가 선택한것
    // 버튼을 눌렀을때의 imgCoord 값 ex) -142px
    clearInterval(interval.current);
    const myScore = scores[choice];
    const cpuScore = scores[computerChoice(imgCoord)]; // ex) 맨위의 함수로 인해 가위가 들어감
    const diff = myScore - cpuScore;
    if (diff === 0) {
      setResult("비겼습니다");
    } else if ([-1, 2].includes(diff)) {
      setResult("이겼습니다");
      setScore((prevScore) => prevScore + 1);
    } else {
      setResult("졌습니다");
      setScore((prevScore) => prevScore - 1);
    }
    setTimeout(() => {
      interval.current = setInterval(changedHand, 50);
    }, 1000);
  };

  return (
    <>
      <div
        id="computer"
        style={{
          background: `url(http://en.pimg.jp/023/182/267/1/23182267.jpg) ${imgCoord} 0`,
        }}
      ></div>
      <div>
        <button id="rock" className="btn" onClick={onClickBtn("바위")}>
          바위
        </button>
        <button id="scissor" className="btn" onClick={onClickBtn("가위")}>
          가위
        </button>
        <button id="paper" className="btn" onClick={onClickBtn("보")}>
          보
        </button>
      </div>
      <div>{result}</div>
      <div>현재 {score}점</div>
    </>
  );
};

export default RSP;
