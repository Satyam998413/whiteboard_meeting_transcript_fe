// src/store/boardSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  boards: [], // { id, title, workspaceId, ... }
  currentBoardId: null,
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setBoards(state, action) {
      state.boards = action.payload;
    },
    setCurrentBoard(state, action) {
      state.currentBoardId = action.payload;
    },
    addBoard(state, action) {
      state.boards.push(action.payload);
    },
    updateBoard(state, action) {
      const idx = state.boards.findIndex((b) => b.id === action.payload.id);
      if (idx !== -1) state.boards[idx] = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setBoards, setCurrentBoard, addBoard, updateBoard, setLoading, setError } = boardSlice.actions;
export const selectBoards = (state) => state.board.boards;
export const selectCurrentBoardId = (state) => state.board.currentBoardId;
export default boardSlice.reducer;
