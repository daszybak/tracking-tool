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
import useStopwatches from "@/src/hooks/useStopwatchService";
import convertMsToTime from "@/src/utils/convertMsToTime";
import TTEditCell from "@/src/components/TTEditCell/TTEditCell";

const queryReducer = (state, action) => {
  switch (action.type) {
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_START_DATE":
      return { ...state, startDate: action.payload };
    case "SET_END_DATE":
      return { ...state, endDate: action.payload };
    case "SET_DESC":
      return { ...state, desc: action.payload };
    default:
      return state;
  }
};
const pageSize = 50;
const tableRows = 5;

export default function History() {
  const [queryState, dispatch] = useReducer(queryReducer, {
    page: 1,
    startDate: null,
    endDate: null,
    desc: "",
  });
  const [loading, setLoading] = useState(true);
  const { state, deleteStopwatch, editStopwatch, fetchData, updateStopwatchDescription } =
    useStopwatches();

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData(pageSize, queryState.startDate, queryState.endDate, queryState.desc);
      setLoading(false);
    })();
  }, [fetchData, queryState.startDate, queryState.endDate, queryState.desc]);

  const dataTableValue = state.stopwatches.map((stopwatch) => {
    return {
      id: stopwatch.id,
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

  const handleEditDescription = async (id, description) => {
    try {
      setLoading(true);
      await updateStopwatchDescription(id, description);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  console.log(dataTableValue);

  return (
    <div className="history">
      <h1>
        <NounDailyCalendar /> History ({getTodaysDateFormatted()})
      </h1>
      <div className="action-filter-container">
        <Calendar
          value={queryState.startDate}
          onChange={(e) => dispatch({ type: "SET_START_DATE", payload: new Date(e.value) })}
          // TODO keep localized date format
          dateFormat="dd-mm-yy"
          placeholder="Start Date"
          showIcon
          // icon={<NounDailyCalendar />}
        />
        <Calendar
          value={queryState.endDate}
          onChange={(e) => dispatch({ type: "SET_END_DATE", payload: new Date(e.value) })}
          // TODO keep localized date format
          dateFormat="dd-mm-yy"
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
      {/* // TODO fix */}
      <span>Click on description cell to edit</span>
      <DataTable
        value={dataTableValue}
        paginator
        rows={tableRows}
        loading={loading}
        first={(queryState.page - 1) * tableRows}
        onPage={(e) => {
          const newPage = e.first / e.rows + 1;
          dispatch({ type: "SET_PAGE", payload: newPage });
        }}
      >
        <Column field="startDate" header="Date" className="start-column" />
        <Column
          field="description"
          header="Description"
          className="description-column"
          editor={(props) => (
            <TTEditCell
              {...props}
              editorCallback={(newValue) => handleEditDescription(props.rowData.id, newValue)}
            />
          )}
        />
        <Column field="duration" header="Time Tracked" className="duration-column" />
        <Column field="actions" header="Actions" className="actions-column" />
      </DataTable>
    </div>
  );
}
