import { StyleSheet, View, Image } from "react-native";
import colors from "../assets/colors/colors";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

function SplashScreen() {
  async function handleLogout(values) {
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/auth/logout",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (data.Result == false) {
        showToast("Error", data.Errors[0]);
      } else {
        console.log("hi");
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    handleLogout();
  }, []);

  const navigation = useNavigation();

  setTimeout(() => navigation.replace("Auth"), 2500);

  return (
    <View style={styles.screen}>
      <Image
        style={{ width: "100%", objectFit: "cover" }}
        source={require("../assets/splashScreen.png")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.main,
  },
});

export default SplashScreen;
