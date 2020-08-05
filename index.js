const express = require('express')
const cors = require("cors")
const { match } = require('assert')
const app = express()
app.use(cors())
const port = process.env.PORT || 3000

require('es6-promise').polyfill();
require('isomorphic-fetch');

async function getChapters() {
    let html = ""
    await fetch('http://onepiecepower.info/anime/onepiece/subita/lista-episodi')
        .then(function (response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.text();
        })
        .then(function (res) {
            html = res.toString()
        }).catch((reason) => {
            console.log(reason.toString())
        });

    let regex = /<a href="pagine\/[0-9]*">Episodio ([0-9]*) - (.*)<\/a>/g;
    let data;
    let chapters = []
    while ((data = regex.exec(html)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (data.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        let number = 0
        // The result can be accessed through the `m`-variable.
        data.forEach((match, groupIndex) => {
            // console.log(`Found match, group ${groupIndex}: ${match}`);
            if (groupIndex === 1) number = parseInt(match)
            if (groupIndex === 2) {
                number = chapters.push([
                    number, // chapter
                    match // title
                ])
            }
        });
    }
    return chapters
}

app.get('/', (req, res) => {
    res.send("I'm running!")
})

app.get('/chapters', async (req, res) => {
    // TODO cache the response
    res.send(await getChapters())
})

app.listen(port, () => {
    console.log(`I'm listening at http://localhost:${port}`)
})