import React, { useReducer, createContext, useMemo, useEffect } from "react";
import Table from "./Table";
import Form from "./Form";

export const CODE = {
  MINE: -7,
  NORMAL: -1,
  QUESTION: -2,
  FLAG: -3,
  QUESTION_MINE: -4,
  FLAG_MINE: -5,
  CLICKED_MINE: -6,
  OPENED: 0,
};

export const TableContext = createContext({
  tableData: [],
  halted: true,
  diapatch: () => {},
});

const initialState = {
  tableData: [],
  data: {
    row: 0,
    cell: 0,
    mine: 0,
  },
  timer: 0,
  result: "",
  halted: true,
  openedCount: 0,
};

const plantMine = (row, cell, mine) => {
  const candidate = Array(row * cell)
    .fill()
    .map((arr, i) => {
      return i;
    });
  const shuffle = [];
  while (candidate.length > row * cell - mine) {
    const chosen = candidate.splice(
      Math.floor(Math.random() * candidate.length),
      1
    )[0];
    shuffle.push(chosen);
  }
  const data = [];
  for (let i = 0; i < row; i++) {
    const rowData = [];
    data.push(rowData);
    for (let j = 0; j < cell; j++) {
      rowData.push(CODE.NORMAL);
    }
  }

  for (let k = 0; k < shuffle.length; k++) {
    const ver = Math.floor(shuffle[k] / cell);
    const hor = shuffle[k] % cell;
    data[ver][hor] = CODE.MINE;
  }

  return data;
};

export const START_GAME = "START_GAME";
export const OPEN_CELL = "OPEN_CELL";
export const CLICK_MINE = "CLICK_MINE";
export const FLAG_CELL = "FLAG_CELL";
export const QUESTION_CELL = "QUESTION_CELL";
export const NORMALIZE_CELL = "NORMALIZE_CELL";
export const INCREMENT_TIMER = " INCREMENT_TIMER";

const reducer = (state, action) => {
  switch (action.type) {
    case START_GAME:
      return {
        ...state,
        data: { row: action.row, cell: action.cell, mine: action.mine },
        tableData: plantMine(action.row, action.cell, action.mine),
        halted: false,
        openedCount: 0,
        timer: 0,
        result: "",
      };
    case OPEN_CELL: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      tableData.forEach((row, i) => {
        tableData[i] = [...state.tableData[i]];
      });
      const checked = [];
      let openedCount = 0;

      const checkAround = (row, cell) => {
        if (
          [
            CODE.OPENED,
            CODE.FLAG_MINE,
            CODE.FLAG,
            CODE.QUESTION_MINE,
            CODE.QUESTION,
          ].includes(tableData[row][cell]) // 선택한(된) cell이 위 5개중 1개를 포함할 경우 true(닫힌 칸만 열기)
        ) {
          return;
        }
        if (
          row < 0 ||
          row >= tableData.length ||
          cell < 0 ||
          cell >= tableData[0].length
        ) {
          // => 상하좌우 없는칸은 안 열기
          return;
        }
        if (checked.includes(row + "," + cell)) {
          // checked배열에 row,cell이 포함되있을 시 (이미 검사한 칸이면 무시)
          return;
        } else {
          checked.push(row + "," + cell);
        }

        let around = [];
        if (tableData[row - 1]) {
          // 선택한(된) cell 위 3칸 존재할 시
          around = around.concat(
            // 위 세칸 CODE around로 concat
            tableData[row - 1][cell - 1],
            tableData[row - 1][cell],
            tableData[row - 1][cell + 1]
          );
        }
        around = around.concat(
          // 양옆 CODE around로 concat
          tableData[row][cell - 1],
          tableData[row][cell + 1]
        );
        if (tableData[row + 1]) {
          // 선택한(된) cell 아래 3칸 존재할 시
          around = around.concat(
            // 밑 세칸 CODE around로 concat
            tableData[row + 1][cell - 1],
            tableData[row + 1][cell],
            tableData[row + 1][cell + 1]
          );
        }
        const count = around.filter(
          (
            v // around안의 지뢰만 모아 count배열.length
          ) => [CODE.MINE, CODE.FLAG_MINE, CODE.QUESTION_MINE].includes(v)
        ).length;

        if (count === 0) {
          // 근처 9칸에 지뢰가 없을 시
          if (row > -1) {
            const near = [];
            if (row - 1 > -1) {
              // 선택한(된) cell이 가장 위칸이 아닐 경우
              near.push([row - 1, cell - 1]);
              near.push([row - 1, cell]);
              near.push([row - 1, cell + 1]); // 선택한(된) cell 위 3칸 좌표배열 near로 push
            }
            near.push([row, cell - 1]);
            near.push([row, cell + 1]); // 선택한(된) cell 좌우 좌표배열 near로 push
            if (row + 1 < tableData.length) {
              // 선택한(된) cell이 가장 밑칸이 아닐 경우
              near.push([row + 1, cell - 1]);
              near.push([row + 1, cell]);
              near.push([row + 1, cell + 1]); // 선택한(된) cell 밑 3칸 좌표배열 near로 push
            }
            near.forEach((n) => {
              // ex)) near = [[1,2][3,4][5,6][7,8]]
              if (tableData[n[0]][n[1]] !== CODE.OPENED) {
                // near 각각의 좌표배열->CODE 가 open칸이 아닐 경우
                checkAround(n[0], n[1]); // near 각각의 좌표배열로 checkAround 재귀
              }
            });
          }
        }
        if (tableData[row][cell] === CODE.NORMAL) {
          openedCount += 1;
        }
        tableData[row][cell] = count; // 선택한(된)한 cell 주변9칸 지뢰갯수
      };
      checkAround(action.row, action.cell);
      let halted = false;
      let result = "";
      if (
        state.data.row * state.data.cell - state.data.mine ===
        state.openedCount + openedCount
      ) {
        halted = true;
        result = `${state.timer}초만에 승리하셨습니다`;
      }

      return {
        ...state,
        tableData,
        openedCount: state.openedCount + openedCount,
        halted,
        result,
      };
    }
    case CLICK_MINE: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      tableData[action.row][action.cell] = CODE.CLICKED_MINE;
      return {
        ...state,
        tableData,
        halted: true,
      };
    }

    case FLAG_CELL: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      if (tableData[action.row][action.cell] === CODE.MINE) {
        tableData[action.row][action.cell] = CODE.FLAG_MINE;
      } else {
        tableData[action.row][action.cell] = CODE.FLAG;
      }
      return {
        ...state,
        tableData,
      };
    }

    case QUESTION_CELL: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      if (tableData[action.row][action.cell] === CODE.FLAG_MINE) {
        tableData[action.row][action.cell] = CODE.QUESTION_MINE;
      } else {
        tableData[action.row][action.cell] = CODE.QUESTION;
      }
      return {
        ...state,
        tableData,
      };
    }

    case NORMALIZE_CELL: {
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      if (tableData[action.row][action.cell] === CODE.QUESTION_MINE) {
        tableData[action.row][action.cell] = CODE.MINE;
      } else {
        tableData[action.row][action.cell] = CODE.NORMAL;
      }
      return {
        ...state,
        tableData,
      };
    }
    case INCREMENT_TIMER: {
      return {
        ...state,
        timer: state.timer + 1,
      };
    }

    default:
      return state;
  }
};

const MineSearch = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { timer, result, tableData, halted } = state;
  const value = useMemo(
    () => ({ tableData, dispatch, halted }),
    [tableData, halted]
  );

  useEffect(() => {
    let timer;
    if (halted === false) {
      timer = setInterval(() => {
        dispatch({ type: INCREMENT_TIMER });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [halted]);

  return (
    <TableContext.Provider value={value}>
      <Form />
      <div>{timer}</div>
      <Table />
      <div>{result}</div>
    </TableContext.Provider>
  );
};

export default MineSearch;
