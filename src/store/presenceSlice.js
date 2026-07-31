import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  collaborators: [], // [{ clientId, user: { id, name, color }, cursor: {x,y}|null }]
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setCollaborators(state, action) {
      state.collaborators = action.payload;
    },
    clearCollaborators(state) {
      state.collaborators = [];
    },
  },
});

export const { setCollaborators, clearCollaborators } = presenceSlice.actions;
export const selectCollaborators = (state) => state.presence.collaborators;
export default presenceSlice.reducer;
