import { configureStore } from '@reduxjs/toolkit';

import {articleApi} from './article';

// Then use `rootReducer` in your store configuration
const store = configureStore({
  reducer: {[articleApi.reducerPath]:articleApi.reducer},   
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(articleApi.middleware),
});

export default store;
