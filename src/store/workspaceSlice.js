// src/store/workspaceSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  workspaces: [], // array of { id, name, boards: [] }
  currentWorkspaceId: null,
  loading: false,
  error: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspaces(state, action) {
      state.workspaces = action.payload;
    },
    setCurrentWorkspace(state, action) {
      state.currentWorkspaceId = action.payload;
    },
    addWorkspace(state, action) {
      state.workspaces.push(action.payload);
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setWorkspaces, setCurrentWorkspace, addWorkspace, setLoading, setError } = workspaceSlice.actions;
export const selectWorkspaces = (state) => state.workspace.workspaces;
export const selectCurrentWorkspaceId = (state) => state.workspace.currentWorkspaceId;
export default workspaceSlice.reducer;
