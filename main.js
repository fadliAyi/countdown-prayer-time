import axios from "axios";
import fs from "fs";
import path from "path";

let calculateTimePrayer = timeObject => {
    let now = new Date();
    let prayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), timeObject.split(":")[0], timeObject.split(":")[1]);
    let addZeroHours = String(prayTime.getHours() - now.getHours());
    let addZeroMinutes = String(60 - now.getMinutes());
    addZeroHours = addZeroHours.padStart(2, "0");
    addZeroMinutes = addZeroMinutes.padStart(2, "0");
    return `-${addZeroHours}:${addZeroMinutes}`;
}
let writePrayerTime = prayerJson => {
    return new Promise((resolve, reject) => {
        fs.writeFile("prayer.json", JSON.stringify(prayerJson), "utf8", function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}
let aladhan = async () => {
    let month = new Date().getMonth() + 1;
    let year = new Date().getFullYear();
    let prayerTimeRaw = fs.readFileSync("prayer.json");
    let prayerTime = JSON.parse(prayerTimeRaw);

    //rewrite every month;
    if(new Date().getDate() == 1){
        prayerTime = await axios.get(`http://api.aladhan.com/v1/calendar?latitude=-5.1455512&longitude=119.4261574&method=2&month=${month}&year=${year}`);
        await writePrayerTime(prayerTime.data);

        //re-read
        prayerTimeRaw = fs.readFileSync("prayer.json");
        prayerTime = JSON.parse(prayerTimeRaw);
    }

    if(prayerTime.code == 200){
        let data = prayerTime.data;
        let date = new Date().getDate().toString().padStart(2, "0");

        let schedule = data.find(item => {
            return item.date.gregorian.day == date;
        });

        let timeObject = {
            Fajr: schedule.timings["Fajr"].split(" (WITA)")[0],
            Sunrise: schedule.timings["Sunrise"].split(" (WITA)")[0],
            Dhuhr: schedule.timings["Dhuhr"].split(" (WITA)")[0],
            Asr: schedule.timings["Asr"].split(" (WITA)")[0],
            Sunset: schedule.timings["Sunset"].split(" (WITA)")[0],
            Maghrib: schedule.timings["Maghrib"].split(" (WITA)")[0],
            Isha: schedule.timings["Isha"].split(" (WITA)")[0],
            Imsak: schedule.timings["Imsak"].split(" (WITA)")[0]
        }

        let currentTime = new Date().getHours().toString().padStart(2, "0") + ":" + new Date().getMinutes().toString().padStart(2, "0");

        if(timeObject["Fajr"] > currentTime){
            let remainingTime = calculateTimePrayer(timeObject["Fajr"]);
            console.log(`Subuh: ${remainingTime}`);
            process.exit();
        }

        if(timeObject["Dhuhr"] > currentTime){
            let remainingTime = calculateTimePrayer(timeObject["Dhuhr"]);
            console.log(`Dhuhr: ${remainingTime}`);
            process.exit();
        }

        if(timeObject["Asr"] > currentTime){
            let remainingTime = calculateTimePrayer(timeObject["Asr"]);
            console.log(`Ashar: ${remainingTime}`);
            process.exit();
        }

        if(timeObject["Maghrib"] > currentTime){
            let remainingTime = calculateTimePrayer(timeObject["Maghrib"]);
            console.log(`Magrib: ${remainingTime}`);
            process.exit();
        }

        if(timeObject["Isha"] > currentTime){
            let remainingTime = calculateTimePrayer(timeObject["Isha"]);
            console.log(`Isya: ${remainingTime}`);
            process.exit();
        }
    }
    process.exit();
}

aladhan();