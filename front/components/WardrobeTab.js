import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WardrobeScreen from "../screens/WardrobeScreen";
import ItemScreen from "../screens/ItemScreen";
import colors from "../assets/colors/colors";
import UploadItemScreen from "../screens/UploadItemScreen";
import ProcessingScreen from "./ProcessingScreen";

const Stack = createNativeStackNavigator();

function WardrobeTab() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Wardrobe"
        component={WardrobeScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.main },
          headerTitle: "Wardrobe",
          headerTitleStyle: { fontFamily: "higuen", fontSize: 32 },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="ItemScreen"
        component={ItemScreen}
        options={{
          title: "Item",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.main },
          headerTitleStyle: { fontFamily: "higuen", fontSize: 32 },
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="UploadItemScreen"
        component={UploadItemScreen}
        options={{
          title: "Add New Item",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.main },
          headerTitleStyle: { fontFamily: "higuen", fontSize: 32 },
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="ProcessingScreen"
        component={ProcessingScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default WardrobeTab;
