import { StyleSheet, View, Image } from "react-native";
import colors from "../assets/colors/colors";
import { useNavigation } from "@react-navigation/native";

function SplashScreen() {
  const navigation = useNavigation();

  setTimeout(() => navigation.replace("MainApp"), 2500);

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
