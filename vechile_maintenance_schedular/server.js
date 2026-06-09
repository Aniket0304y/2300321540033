const express = require("express");
const axios = require("axios");
const logger = require("../logging_middleware/logger");
const app = express();

app.use(logger);
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhbmlrZXQuMjNiMTU0MTA4MUBhYmVzLmFjLmluIiwiZXhwIjoxNzgwOTkyNDMxLCJpYXQiOjE3ODA5OTE1MzEsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIzZWU5N2FiMi0wMzkwLTQzMDktYWExZC1jZTMxNjNhNDYyMmUiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJhbmlrZXQgeWFkYXYiLCJzdWIiOiJiYTdmZjg2Mi05ODJhLTQ3YjEtYTkwYi04NGY4ZGY3YzZkNDIifSwiZW1haWwiOiJhbmlrZXQuMjNiMTU0MTA4MUBhYmVzLmFjLmluIiwibmFtZSI6ImFuaWtldCB5YWRhdiIsInJvbGxObyI6IjIzMDAzMjE1NDAwMzMiLCJhY2Nlc3NDb2RlIjoiY1h1cWh0IiwiY2xpZW50SUQiOiJiYTdmZjg2Mi05ODJhLTQ3YjEtYTkwYi04NGY4ZGY3YzZkNDIiLCJjbGllbnRTZWNyZXQiOiJHYUhadHJUemtiSnV2UW5rIn0.5zLLEK-iSYpJGlRCz_fRGdISKe9jkMD4v4wlxU1jqew";


const api = axios.create({
    baseURL: "http://4.224.186.213/evaluation-service",
    headers: {
        Authorization: `Bearer ${TOKEN}`
    }
});

app.get("/", async (req, res) => {
    try {

        const depotsRes = await api.get("/depots");
        const vehiclesRes = await api.get("/vehicles");
        const notificationsRes = await api.get("/notifications");

        const depots = depotsRes.data.depots;
        const vehicles = vehiclesRes.data.vehicles;
        const notifications = notificationsRes.data.notifications;

        vehicles.forEach(v => {
            v.score = v.Impact / v.Duration;
        });

        vehicles.sort((a, b) => b.score - a.score);

        let depotHours = {};

        depots.forEach(d => {
            depotHours[d.ID] = d.MechanicHours;
        });

        let schedule = [];

        for (let task of vehicles) {

            let assigned = false;

            for (let depot of depots) {

                if (depotHours[depot.ID] >= task.Duration) {

                    schedule.push({
                        TaskID: task.TaskID,
                        DepotID: depot.ID,
                        Duration: task.Duration,
                        Impact: task.Impact
                    });

                    depotHours[depot.ID] -= task.Duration;

                    assigned = true;
                    break;
                }
            }

            if (!assigned) {
                break;
            }
        }

        res.json({
            depots,
            notifications,
            schedule,
            remainingHours: depotHours
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

app.listen(3000, () => {
    console.log("Server Running on Port 3000");
});