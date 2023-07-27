"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import NounPlay from "@/src/icons/NounPlay";
import NounStopButton from "@/src/icons/NounStopButton";
import NounPause from "@/src/icons/NounPause";
import NounTrash from "@/src/icons/NounTrash";
import NounEdit from "@/src/icons/NounEdit";
import TTErrorMessage from "@/src/components/TTErrorMessage/TTErrorMessage";
import ActiveStopwatch from "@/src/components/ActiveStopwatch/ActiveStopwatch";
import useErrors from "@/src/hooks/useErrors";
import convertMsToTime from "@/src/utils/convertMsToTime";
import useStopwatches from "@/src/hooks/useStopwatchService";
import TTEditCell from "@/src/components/TTEditCell/TTEditCell";

const pageSize = 5;
const syncToFirestoreDelay = 10000;

export default function Trackers() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const { isErrors, addError, clearErrors, getErrorsString } = useErrors();
  const [page, setPage] = useState(1);
  const {
    state,
    startNewStopwatch,
    stopStopwatch,
    startStopwatch,
    stopAllStopwatches,
    deleteStopwatch,
    updateStopwatchDescription,
    syncToFirestore,
    fetchData,
  } = useStopwatches();

  const syncInterval = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData(pageSize);
      clearErrors();
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSyncToFirestore = useCallback(async () => {
    try {
      await syncToFirestore();
      clearErrors();
    } catch (error) {
      console.error(err);
      addError("Error syncing to firestore:" + err);
    }
  }, [syncToFirestore, addError, clearErrors]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(syncInterval.current);
      } else {
        syncInterval.current = setInterval(handleSyncToFirestore, syncToFirestoreDelay);
      }
    };

    syncInterval.current = setInterval(handleSyncToFirestore, syncToFirestoreDelay);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(syncInterval.current);
    };
  }, [handleSyncToFirestore]);

  const handleNewStopwatch = async () => {
    try {
      setLoading(true);
      await startNewStopwatch(description);
    } catch (error) {
    } finally {
      setDescription("");
      // setPage(1);
      setLoading(false);
    }
  };

  const handleStartStopwatch = async (id) => {
    try {
      setLoading(true);
      await startStopwatch(id);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStopwatch = async (id) => {
    try {
      setLoading(true);
      await deleteStopwatch(id);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleStopStopwatch = async (id) => {
    try {
      setLoading(true);
      await stopStopwatch(id);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleStopAllStopwatches = async () => {
    try {
      setLoading(true);
      await stopAllStopwatches();
      clearErrors();
    } catch (error) {
      console.error(error);
      addError("Error stopping all stopwatches:" + error);
    } finally {
      setLoading(false);
    }
  };

  const dataTableValue = state.stopwatches.map((stopwatch) => {
    const isActive = state.activeStopwatchId === stopwatch.id;
    return {
      id: stopwatch.id,
      description: stopwatch.description,
      duration: isActive ? (
        <ActiveStopwatch startTime={stopwatch.startTime} />
      ) : (
        convertMsToTime(stopwatch.duration)
      ),
      actions: (
        <div key={stopwatch.id} className="actions-cell">
          {!isActive ? (
            <NounPlay onClick={() => handleStartStopwatch(stopwatch.id)} />
          ) : (
            <NounPause onClick={() => handleStopStopwatch(stopwatch.id)} />
          )}
          <NounStopButton onClick={() => handleStopStopwatch(stopwatch.id)} />
          <NounEdit />
          <NounTrash onClick={() => handleDeleteStopwatch(stopwatch.id)} />
        </div>
      ),
    };
  });

  const handleEditDescription = async (id, description) => {
    try {
      setLoading(true);
      await updateStopwatchDescription(id, description);
      clearErrors();
    } catch (error) {
      console.error(error);
      addError("Error updating stopwatch description:" + error);
    }
  };

  // TODO create subcomponents to fix unecessary rerenders
  return (
    <div className="trackers">
      <h1>Trackers</h1>
      <div className="action-filter-container">
        <InputText
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          placeholder="Add description"
        />
        <Button icon={<NounPlay />} onClick={() => handleNewStopwatch()} className="start-button">
          Start new timer
        </Button>
        <Button
          icon={<NounStopButton />}
          onClick={() => handleStopAllStopwatches()}
          className="stop-button"
        >
          Stop all
        </Button>
      </div>
      {/* // TODO fix */}
      <span>Click on description cell to edit</span>
      <DataTable
        value={dataTableValue}
        paginator
        rows={pageSize}
        first={(page - 1) * pageSize}
        onPage={(e) => {
          const newPage = e.first / e.rows + 1;
          setPage(newPage);
        }}
        loading={loading}
        editMode="cell"
      >
        <Column field="duration" header="Time Logged" className="duration-column" />
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
