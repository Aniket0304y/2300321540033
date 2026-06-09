const express = require("express");
const axios = require("axios");

const app = express();

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhbmlrZXQuMjNiMTU0MTA4MUBhYmVzLmFjLmluIiwiZXhwIjoxNzgwOTkyNDMxLCJpYXQiOjE3ODA5OTE1MzEsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIzZWU5N2FiMi0wMzkwLTQzMDktYWExZC1jZTMxNjNhNDYyMmUiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJhbmlrZXQgeWFkYXYiLCJzdWIiOiJiYTdmZjg2Mi05ODJhLTQ3YjEtYTkwYi04NGY4ZGY3YzZkNDIifSwiZW1haWwiOiJhbmlrZXQuMjNiMTU0MTA4MUBhYmVzLmFjLmluIiwibmFtZSI6ImFuaWtldCB5YWRhdiIsInJvbGxObyI6IjIzMDAzMjE1NDAwMzMiLCJhY2Nlc3NDb2RlIjoiY1h1cWh0IiwiY2xpZW50SUQiOiJiYTdmZjg2Mi05ODJhLTQ3YjEtYTkwYi04NGY4ZGY3YzZkNDIiLCJjbGllbnRTZWNyZXQiOiJHYUhadHJUemtiSnV2UW5rIn0.5zLLEK-iSYpJGlRCz_fRGdISKe9jkMD4v4wlxU1jqew";

app.get("/check", (req,res)=>{
    res.send(TOKEN);
});
app.get("/", async (req, res) => {

    try {

        const data = await axios.get(
            "http://4.224.186.213/evaluation-service/notifications",
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        let arr = data.data.notifications;

        const wt = {
            Placement: 3,
            Result: 2,
            Event: 1
        };

        arr.forEach(x => {

            let age =
                (Date.now() - new Date(x.Timestamp)) / 3600000;

            x.score =
                wt[x.Type] * 100 - age;
        });

        arr.sort((a, b) => b.score - a.score);

        res.json(arr.slice(0, 10));

    } catch (e) {

    console.log("STATUS:", e.response?.status);
    console.log("DATA:", e.response?.data);
    console.log("HEADERS:", e.response?.headers);

    res.status(500).json({
        error: e.message,
        details: e.response?.data
    });
}
});

app.listen(4000, () => {
    console.log("Notification server running");
});