import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming VITE_RAPID_API_PARAPHRASE_KEY and VITE_RAPID_API_PARAPHRASE_HOST are defined in your.env file
const rapidApiKey = import.meta.env.VITE_RAPID_API_PARAPHRASE_KEY;
const rapidApiHost = import.meta.env.VITE_RAPID_API_PARAPHRASE_HOST;

export const paraphraseApi = createApi({
    reducerPath: 'paraphraseApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://paraphrase-genius.p.rapidapi.com/dev/paraphrase',
        prepareHeaders: (headers) => {
            headers.set('X-RapidAPI-Key', rapidApiKey);
            headers.set('X-RapidAPI-Host', rapidApiHost);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        paraphraseText: builder.mutation({
            query: (text) => ({
                url: '', // Corrected URL path
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    text: text,
                    result_type: 'single',
                },
            }),
        }),       
    }), 
});

export const { useParaphraseTextMutation } = paraphraseApi;
