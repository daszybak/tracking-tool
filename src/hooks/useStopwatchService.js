import { useReducer, useEffect, useState, useCallback, useRef } from "react";
import {
  getDocs,
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  startAfter,
  limit,
  where,
  writeBatch,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "@/src/firebase";
import { useUser } from "@/src/contexts/AuthContext";

const initialState = {
  activeStopwatchId: null,
  stopwatches: [],
  lastVisible: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_ACTIVE_STOPWATCH":
      return { ...state, activeStopwatchId: action.payload };
    case "SET_STOPWATCHES":
      return {
        ...state,
        stopwatches: action.payload.stopwatches,
        lastVisible: action.payload.lastVisible ?? state.lastVisible,
        activeStopwatchId: action.payload.activeStopwatchId ?? state.activeStopwatchId,
      };
    case "UPDATE_STOPWATCH": {
      const updatedStopwatches = state.stopwatches.map((stopwatch) => {
        if (stopwatch.id === action.payload.id) {
          return {
            ...stopwatch,
            ...action.payload,
          };
        } else {
          return stopwatch;
        }
      });
      return { ...state, stopwatches: updatedStopwatches };
    }
    default:
      return state;
  }
}

export default function useStopwatcheService() {
  const db = getFirestore(app);
  const { user } = useUser();
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = useCallback(
    async (pageSize, startAfter = null, startDate = null, endDate = null, description = null) => {
      try {
        const userTrackersCollection = collection(db, `users/${user.uid}/trackers`);
        let stopwatchQuery = query(userTrackersCollection, orderBy("startTime", "desc"));

        if (startAfter) {
          const startAfterDoc = doc(db, `users/${user.uid}/trackers`, startAfter);
          const startAfterSnapshot = await getDoc(startAfterDoc);
          stopwatchQuery = query(stopwatchQuery, startAfter(startAfterSnapshot));
        }

        if (startDate && endDate) {
          stopwatchQuery = query(
            stopwatchQuery,
            where("startTime", ">=", startDate),
            where("startTime", "<=", endDate),
          );
        }

        if (description) {
          stopwatchQuery = query(stopwatchQuery, where("description", "==", description));
        }

        stopwatchQuery = query(stopwatchQuery, limit(pageSize));

        const querySnapshot = await getDocs(stopwatchQuery);
        const stopwatches = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        if (stopwatches.length > 0) {
          dispatch({
            type: "SET_STOPWATCHES",
            payload: {
              stopwatches,
              lastVisible: stopwatches.at(-1).id,
              activeStopwatchId: stopwatches.find((value) => value.isRunning === true)?.id ?? "",
            },
          });
        }
      } catch (err) {
        throw err;
      }
    },
    [db, user.uid],
  );

  const deleteStopwatch = async (id) => {
    const originalStopwatch = state.stopwatches.find((sw) => sw.id === id);
    const originalState = { ...originalStopwatch };
    const updatedStopwatches = state.stopwatches.filter((sw) => sw.id !== id);

    dispatch({
      type: "SET_STOPWATCHES",
      payload: {
        stopwatches: updatedStopwatches,
        lastVisible: state.lastVisible,
        ...(id === state.activeStopwatchId ? { activeStopwatchId: null } : {}),
      },
    });

    try {
      await deleteDoc(doc(db, `users/${user.uid}/trackers`, id));

      // const newDocQuery = query(
      //   collection(db, `users/${user.uid}/trackers`),
      //   orderBy("startTime", "desc"),
      //   startAfter(state.lastVisible),
      //   limit(1),
      // );
      // const newDocSnapshot = await getDocs(newDocQuery);

      // if (!newDocSnapshot.empty) {
      //   const newDoc = newDocSnapshot.docs[0];
      //   dispatch({
      //     type: "SET_STOPWATCHES",
      //     payload: {
      //       stopwatches: [...updatedStopwatches, { id: newDoc.id, ...newDoc.data() }],
      //       lastVisible: newDoc.id,
      //     },
      //   });
      // }
    } catch (err) {
      dispatch({
        type: "SET_STOPWATCHES",
        payload: [...originalState, ...state.stopwatches],
      });
    }
  };

  const startNewStopwatch = async (description) => {
    const newStopwatch = {
      startTime: new Date().toISOString(),
      isRunning: true,
      description: description,
      endTime: null,
      duration: null,
      startDate: new Date().toISOString().split("T")[0],
    };

    try {
      if (state.activeStopwatchId) {
        await stopStopwatch(state.activeStopwatchId);
      }

      const userTrackersCollection = collection(db, `users/${user.uid}/trackers`);
      const docRef = await addDoc(userTrackersCollection, newStopwatch);

      const newStopwatchData = { id: docRef.id, ...newStopwatch };
      dispatch({
        type: "SET_STOPWATCHES",
        payload: {
          stopwatches: [newStopwatchData, ...state.stopwatches],
          lastVisible: state.lastVisible,
          activeStopwatchId: docRef.id,
        },
      });
    } catch (err) {
      dispatch({
        type: "SET_STOPWATCHES",
        payload: {
          stopwatches: originalStopwatches,
        },
      });
    }
  };

  const stopStopwatch = async (activeStopwatchId) => {
    const activeStopwatch = state.stopwatches.find((sw) => sw.id === activeStopwatchId);
    if (!activeStopwatch || activeStopwatch.isRunning === false) {
      return;
    }
    const originalStopwatch = { ...activeStopwatch };
    const endTime = new Date();
    activeStopwatch.endTime = endTime.toISOString();
    activeStopwatch.duration = endTime - new Date(activeStopwatch.startTime);
    activeStopwatch.isRunning = false;
    const { id, ...activeStopwatchWithoutId } = activeStopwatch;
    if (activeStopwatchId === state.activeStopwatchId) {
      dispatch({ type: "SET_ACTIVE_STOPWATCH", payload: null });
    }

    try {
      await updateDoc(
        doc(db, `users/${user.uid}/trackers`, state.activeStopwatchId),
        activeStopwatchWithoutId,
      );

      dispatch({
        type: "UPDATE_STOPWATCH",
        payload: activeStopwatch,
      });
    } catch (err) {
      dispatch({
        type: "UPDATE_STOPWATCH",
        payload: originalStopwatch,
      });
    }
  };

  const syncToFirestore = useCallback(
    async (stopwatches) => {
      try {
        const batch = writeBatch(db);

        (stopwatches ?? state.stopwatches).forEach(({ id, ...stopwatch }) => {
          const ref = doc(db, `users/${user.uid}/trackers/${id}`);
          batch.set(ref, stopwatch);
        });

        await batch.commit();
      } catch (err) {
        throw err;
      }
    },
    [db, state.stopwatches, user.uid],
  );

  const startStopwatch = async (id) => {
    const originalActiveState = state.stopwatches.find((sw) => sw.isRunning === true);
    const originalStopped = state.stopwatches.find((sw) => sw.id === id);

    try {
      await stopStopwatch(state.activeStopwatchId);
      const stopwatchDoc = doc(db, `users/${user.uid}/trackers/${id}`);
      const stopwatch = state.stopwatches.find((sw) => sw.id === id);
      const updatedStopwatch = {
        ...stopwatch,
        startTime: new Date(Date.now() - (stopwatch.duration ?? 0)).toISOString(),
        isRunning: true,
        endTime: null,
        duration: null,
      };

      await updateDoc(stopwatchDoc, updatedStopwatch);

      const updatedStopwatches = state.stopwatches.map((sw) =>
        sw.id === id ? updatedStopwatch : sw,
      );

      dispatch({
        type: "SET_STOPWATCHES",
        payload: {
          stopwatches: updatedStopwatches,
          activeStopwatchId: id,
        },
      });
    } catch (err) {
      dispatch({
        type: "SET_STOPWATCHES",
        payload: {
          stopwatches: state.stopwatches.map((sw) =>
            sw.id === originalActiveState.id
              ? originalActiveState
              : sw.id === originalStopped.id
              ? originalStopped
              : sw,
          ),
          activeStopwatchId: originalActiveState.id,
        },
      });
    }
  };

  const stopAllStopwatches = async () => {
    try {
      state.stopwatches.forEach(async (sw) => {
        if (sw.isRunning) {
          await stopStopwatch(sw.id);
        }
      });

      await syncToFirestore();
    } catch (err) {
      throw err;
    }
  };

  const updateStopwatchDescription = async (id, description) => {
    try {
      const targetStopwatch = state.stopwatches.find((sw) => sw.id === id);
      targetStopwatch.description = description;
      await updateDoc(doc(db, `users/${user.uid}/trackers`, id), targetStopwatch);

      const updatedStopwatches = state.stopwatches.map((sw) =>
        sw.id === id ? { ...sw, description: description } : sw,
      );
      dispatch({
        type: "SET_STOPWATCHES",
        payload: { stopwatches: updatedStopwatches, lastVisible: state.lastVisible },
      });
    } catch (err) {
      throw err;
    }
  };

  return {
    state,
    startNewStopwatch,
    stopStopwatch,
    startStopwatch,
    stopAllStopwatches,
    deleteStopwatch,
    updateStopwatchDescription,
    syncToFirestore,
    fetchData,
  };
}
