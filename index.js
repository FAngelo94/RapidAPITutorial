const PORT = process.env.PORT || 8001;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express()

const newspapers = [
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change/',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: ''
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change/',
        base: 'https://www.telegraph.co.uk/'
    }
]

const articles = [];

newspapers.forEach(async (newspaper) => {
    axios.get(newspaper.address)
    .then(response => {
        const html =   response.data;
        const $ = cheerio.load(html);
        $('a:contains("climate")', html).each(function() {
            const article = {
                title: $(this).text(),
                url: newspaper.base + $(this).attr('href'),
                source: newspaper.name
            }
            articles.push(article);
        })

    })
})

app.get('/', (req, res) => {
    res.json("Welcome to my Climate Change News API") 
});

app.get("/news", (req, res) => {
    res.json(articles);
});

app.get("/news/:newspaperId", async (req, res) => {
    const newspaperId = req.params.newspaperId;
    const newspaper = newspapers.find(newspaper => newspaper.name === newspaperId);
    let tmpArticles = [];
    if(!newspaper) {
        res.status(404).json({ message: "Newspaper not found" });
    }
    axios.get(newspaper.address)
    .then(response => {
        const html =   response.data;
        const $ = cheerio.load(html);
        $('a:contains("climate")', html).each(function() {
            const article = {
                title: $(this).text(),
                url: newspaper.base + $(this).attr('href'),
                source: newspaper.name
            }
            console.log("climate", article)
            tmpArticles.push(article);
        })
        res.json(tmpArticles);
    }).catch(err => {
        res.status(500).json({ message: err });
    });
});


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));