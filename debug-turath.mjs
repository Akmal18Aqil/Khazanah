import { search } from 'turath-sdk';

(async () => {
    try {
        console.log("Searching...");
        const results = await search('bukhari');
        if (results.data && results.data.length > 0) {
            console.log("First Result Snip Sample:", results.data[0].snip);
            console.log("Keys:", Object.keys(results.data[0]));
        } else {
            console.log("No results found.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
})();
