import { createNativeStackNavigator } from "@react-navigation/native-stack";

import NavBar from "../components/NavBar";
import AuthNavigator from "../components/AuthNavigator";
import SplashScreen from "../screens/SplashScreen";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="MainApp" component={NavBar} />
    </Stack.Navigator>
  );
}

export default RootNavigator;
