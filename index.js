const express = require('express');
const wikipedia = require('wikipedia-js');
const htmlToText = require('html-to-text');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
const searchWikipedia = (query) => new Promise((resolve,reject) => {
    const options = {
        query: query,
        format: 'html',
        summaryOnly: true
    };

    wikipedia.searchArticle(options, (err, htmlSummary) => {
        if (err) {
            reject(err);
        } else {
            // Convert HTML summary to plain text
            const plainTextSummary = htmlToText.convert(htmlSummary);
            resolve(plainTextSummary);
        }
    });
});


// Serve the openapi.yaml and ai-plugin.json static files from the root directory
app.use('/openapi.yml', express.static('openapi.yml'));
app.use('/legal_info.html', express.static('legal_info.html'));
app.use('/.well-known/ai-plugin.json', express.static('ai-plugin.json'));

app.get('/search', async (req, res) => {
    const query = req.query.query;

    if (query) {
        try {
            const summary = await searchWikipedia(query);
            res.json({summary});
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while searching for the article.' });
        }
    } else {
        res.status(400).json({ error: 'Query parameter is required.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
