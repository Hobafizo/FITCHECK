const { OpenWeatherAPI } = require("openweather-api-node")

async function getWeatherTemp(lat, lon)
{
    try
    {
        const coords = { lat: lat, lon:  lon }    

        let weather = new OpenWeatherAPI({
            key: process.env.WEATHER_API_KEY,
            //locationName: location,
            coordinates: coords,
            units: "metric"
        })

        var res = await weather.getCurrent()
        return res.weather.temp.cur;
    }
    catch (err)
    {
    }
    return null;
}

async function getWeatherSeason(lat, lon)
{
    let temp = await getWeatherTemp(lat, lon)
    if (temp == null)
        return null

    var seasons = []
    console.log(temp)

    if (temp >= 25)
        seasons.push('Summer')

    if (temp >= 23 && temp <= 30)
        seasons.push('Spring')

    if (temp >= 20 && temp <= 27)
        seasons.push('Fall')

    if (temp <= 20)
        seasons.push('Winter')

    return seasons
}

module.exports =
{
    getWeatherTemp,
    getWeatherSeason
};