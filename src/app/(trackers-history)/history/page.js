"use client";

import { useEffect, useReducer, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import NounTrash from "@/src/icons/NounTrash";
import NounEdit from "@/src/icons/NounEdit";
import NounDailyCalendar from "@/src/icons/NounDailyCalendar";
import getTodaysDateFormatted from "@/src/utils/getTodaysDateFormatted";
import useErrors from "@/src/hooks/useErrors";
import TTErrorMessage from "@/src/components/TTErrorMessage/TTErrorMessage";
import { Button } from "primereact/button";
import useStopwatches from "@/src/hooks/useStopwatchService";
import convertMsToTime from "@/src/utils/convertMsToTime";

const queryReducer = (state, action) => {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_START_DATE":
      return { ...state, start_date: action.payload };
    case "SET_END_DATE":
      return { ...state, end_date: action.payload };
    case "SET_DESC":
      return { ...state, desc: action.payload };
    default:
      return state;
  }
};
const pageSize = 10;

export default function History() {
  const [queryState, dispatch] = useReducer(queryReducer, {
    page: 1,
  });
  const { addError, clearErrors, getErrorsString, isErrors } = useErrors();
  const [loading, setLoading] = useState(true);
  const { state, deleteStopwatch, editStopwatch, fetchData } = useStopwatches();

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData(pageSize);
      clearErrors();
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dataTableValue = state.stopwatches.map((stopwatch) => {
    return {
      startDate: new Date(stopwatch.startTime).toLocaleDateString(),
      description: stopwatch.description,
      duration: convertMsToTime(stopwatch.duration),
      actions: (
        <div className="actions-cell">
          <NounEdit onClick={() => editStopwatch(stopwatch.id)} />
          <NounTrash onClick={() => deleteStopwatch(stopwatch.id)} />
        </div>
      ),
    };
  });

  console.log("dataTableValue", dataTableValue);

  // TODO fix this hack
  dataTableValue.unshift({});

  return (
    <div className="history">
      <h1>
        <NounDailyCalendar /> History ({getTodaysDateFormatted()})
      </h1>
      <div className="action-filter-container">
        <Calendar
          value={queryState.start_date}
          onChange={(e) => dispatch({ type: "SET_START_DATE", payload: e.value })}
          // TODO keep localized date format
          dateFormat="dd-mm-yyyy"
          placeholder="Start Date"
          showIcon
          // icon={<NounDailyCalendar />}
        />
        <Calendar
          value={queryState.end_date}
          onChange={(e) => dispatch({ type: "SET_END_DATE", payload: e.value })}
          // TODO keep localized date format
          dateFormat="dd-mm-yyyy"
          placeholder="End Date"
          showIcon
          // icon={<NounDailyCalendar />}
        />
        <InputText
          value={queryState.desc}
          onChange={(e) => dispatch({ type: "SET_DESC", payload: e.target.value })}
          placeholder="Description"
          // icon={<NounClose />}
        />
      </div>
      <DataTable
        value={dataTableValue}
        paginator
        rows={10}
        loading={loading}
        first={queryState.page}
        onPage={(e) => dispatch({ type: "SET_PAGE", payload: e.first / e.rows + 1 })}
      >
        <Column field="startDate" header="Date" className="start-column" />
        <Column field="description" header="Description" className="description-column" />
        <Column field="duration" header="Time Tracked" className="duration-column" />
        <Column field="actions" header="Actions" className="actions-column" />
      </DataTable>
      {isErrors && (
        <>
          <TTErrorMessage error={getErrorsString()} />
          <Button
            onClick={async () => {
              await fetchData();
              clearErrors();
            }}
          >
            Fetch data
          </Button>
        </>
      )}
    </div>
  );
}
