
import { configureStore } from '@reduxjs/toolkit';
import { paraphraseApi } from './paraphraseIt'; // Adjust the import path as necessary

const store = configureStore({
    reducer: {
       // Add your other reducers here
       [paraphraseApi.reducerPath]: paraphraseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
       getDefaultMiddleware().concat(paraphraseApi.middleware),
   });
export default store;
   