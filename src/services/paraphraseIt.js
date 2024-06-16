const handler = async (req, res) => {
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_PARAPHRASER_KEY;

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPEN_AI_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export default handler;




// const apiKey = import.meta.env.VITE_RAPID_API_PARAPHRASE_KEY;
// const apiHost = import.meta.env.VITE_RAPID_API_PARAPHRASE_HOST;

// export const paraphraseApi = createApi({
//     reducerPath: 'paraphraseApi',
//     baseQuery: fetchBaseQuery({
//         baseUrl: 'https://paraphrase-genius.p.rapidapi.com/dev/paraphrase',
//         prepareHeaders: (headers) => {
//             headers.set('X-RapidAPI-Key', apiKey);
//             headers.set('X-RapidAPI-Host', apiHost);
//             return headers;
//         },
//     }),
//     endpoints: (builder) => ({
//         paraphraseText: builder.mutation({
//             query: (text) => ({
//                 url: '', // Corrected URL path
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: {
//                     text: text,
//                     result_type: 'single',
//                 },
//             }),
//         }),       
//     }), 
// });

// export const { useParaphraseTextMutation } = paraphraseApi;

// const http = require('https');

// const options = {
// 	method: 'POST',
// 	hostname: 'paraphrasing-tool1.p.rapidapi.com',
// 	port: null,
// 	path: '/api/rewrite',
// 	headers: {
// 		'content-type': 'application/json',
// 		'X-RapidAPI-Key': 'a528c4b3b8msh1e354fb52ee483cp1fdd9ejsn34fa98f976c4',
// 		'X-RapidAPI-Host': 'paraphrasing-tool1.p.rapidapi.com'
// 	}
// };

// const req = http.request(options, function (res) {
// 	const chunks = [];

// 	res.on('data', function (chunk) {
// 		chunks.push(chunk);
// 	});

// 	res.on('end', function () {
// 		const body = Buffer.concat(chunks);
// 		console.log(body.toString());
// 	});
// });

// req.write(JSON.stringify({
//   sourceText: 'There are several major benefits to moving to plant-based nutrition, all supported by excellent science. '
// }));
// req.end();