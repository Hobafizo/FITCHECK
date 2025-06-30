import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useLocationStore } from "../store/locationStore";

const WeatherCard = () => {
  const [weather, setWeather] = useState();
  const [loading, setLoading] = useState(true);
  const city = useLocationStore((state) => state.city);
  const coords = useLocationStore((state) => state.coords);
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (!coords) return;
    async function handleWeatherApi() {
    setLoading(true);

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY}&units=metric`,
          {
            method: "GET",
          }
        );

        const data = await res.json();
        if (data.Result == false) {
          console.log("Error", data.Errors[0]);
        } else {
          console.log(data);
          const weatherr = {
            temp: Math.round(data.main.temp),
            min: Math.round(data.main.temp_min),
            max: Math.round(data.main.temp_max),
            state: data.weather[0].description,
          };
          console.log("weatherr", weatherr);

          setWeather(weatherr);
        }
      } catch (error) {
        console.error(error);
      }
      finally {
        setLoading(false); 
      }
    }

    handleWeatherApi();
  }, [coords]);

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
      <View style={styles.descriptionContainer}>
        {loading ? (
          <Text style={styles.descriptionText}>Loading...</Text>
        ) : weather && (
          <Text style={styles.descriptionText}>
            {weather?.state}, {weather?.temp}°C
          </Text>
        )}
      </View>
      <View style={styles.cardRow}>
        <View style={styles.locationRow}>
          <Image
            source={require("../assets/map-pointer.png")}
            style={styles.icon}
          />
          <Text style={styles.locationText}>{city || "Unknown"}</Text>
        </View>
        {weather && (
          <View style={styles.weatherRow}>
            <Image
              source={require("../assets/cloud.png")}
              style={styles.weatherIcon}
            />
            <Text style={styles.tempText}>
              L: {weather.min}° H: {weather.max}°
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%", //375
    height: 150,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 0,
    justifyContent: "space-between",
    elevation: 6,
    backgroundColor: "#E8DDCC",
  },
  cardRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  icon: {
    width: 14,
    height: 14,
    marginRight: 2,
    // marginTop: 2,
  },
  locationText: {
    fontSize: 14,
    // fontWeight: 'bold',
    alignItems: "flex-end",
    // fontFamily: "inter",
    color: "#777",
    fontFamily: "inter",
  },
  dateText: {
    color: "#777",
    fontSize: 15,
    // marginVertical: 5,
    fontFamily: "inter",
  },
  locationRow: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  weatherRow: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    // marginTop: -21,
  },
  weatherIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  descriptionContainer: {
    alignItems: "center",
    width: "100%",
  },
  tempText: {
    fontSize: 16,
    color: "#555",
    fontFamily: "inter-bold",
  },
  descriptionText: {
    fontSize: 31,
    textAlign: "left",
    width: "100%",
    lineHeight: 35,
    // paddingBottom: 6,
    // marginTop: 10,
    fontFamily: "higuen",
  },
});

export default WeatherCard;
