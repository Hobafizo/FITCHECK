import { NavigationContainer } from "@react-navigation/native";
import { Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";

import RootNavigator from "./components/RootNavigator";
import { StatusBar } from "expo-status-bar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import ItemScreen from "./screens/ItemScreen";
import * as FileSystem from "expo-file-system";
import { useEffect } from "react";

export default function App() {
  const ensureDirExists = async () => {
    const diruri = FileSystem.documentDirectory + "wardrobe/";
    const dirInfo = await FileSystem.getInfoAsync(diruri);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(diruri, { intermediates: true });
      console.log("wardrobe directory created");
    } else {
      console.log("wardrobe directory already exists");
    }
  };

  useEffect(() => {
    ensureDirExists();
  }, []);
  const [fontsLoaded] = useFonts({
    higuen: require("./assets/Fonts/Higuen Serif.otf"),
    glacial: require("./assets/Fonts/GlacialIndifference-Regular.otf"),
    "glacial-bold": require("./assets/Fonts/GlacialIndifference-Bold.otf"),
    "glacial-italic": require("./assets/Fonts/GlacialIndifference-Italic.otf"),
    AraEtab: require("./assets/Fonts/AraEtabAlMonie_ee-Medium.otf"),
    "poppins-light": require("./assets/Fonts/Poppins/Poppins-Light.ttf"),
    poppins: require("./assets/Fonts/Poppins/Poppins-Regular.ttf"),
    "poppins-medium": require("./assets/Fonts/Poppins/Poppins-Medium.ttf"),
    "poppins-semibold": require("./assets/Fonts/Poppins/Poppins-SemiBold.ttf"),
    "poppins-bold": require("./assets/Fonts/Poppins/Poppins-Bold.ttf"),

    "inter-light": require("./assets/Fonts/inter/Inter-Light.otf"),
    inter: require("./assets/Fonts/inter/Inter-Regular.otf"),
    "inter-medium": require("./assets/Fonts/inter/Inter-Medium.otf"),
    "inter-semibold": require("./assets/Fonts/inter/Inter-SemiBold.otf"),
    "inter-bold": require("./assets/Fonts/inter/Inter-Bold.otf"),

    "roboto-light": require("./assets/Fonts/roboto/Roboto-Light.ttf"),
    roboto: require("./assets/Fonts/roboto/Roboto-Regular.ttf"),
    "roboto-medium": require("./assets/Fonts/roboto/Roboto-Medium.ttf"),
    "roboto-semibold": require("./assets/Fonts/roboto/Roboto-SemiBold.ttf"),
    "roboto-bold": require("./assets/Fonts/roboto/Roboto-Bold.ttf"),
  });

  return (
    <GestureHandlerRootView>
      <StatusBar style="dark" />
      <BottomSheetModalProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
