import { createNativeStackNavigator } from "@react-navigation/native-stack";

import YouScreen from "../screens/YouScreen";
import AccountSettings from "../screens/AccountSettings";
import colors from "../assets/colors/colors";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";

const Stack = createNativeStackNavigator();

function AccountTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="You" component={YouScreen} />
      <Stack.Screen
        name="Settings"
        component={AccountSettings}
        options={{
          headerShown: true,
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerTitleStyle: { fontFamily: "higuen", fontSize: 30 },
          headerStyle: { backgroundColor: colors.main },
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: "Change Password",
          headerShown: true,
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerTitleStyle: { fontFamily: "higuen", fontSize: 30 },
          headerStyle: { backgroundColor: colors.main },
        }}
      />
    </Stack.Navigator>
  );
}

export default AccountTab;
