import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Ionicons } from "@expo/vector-icons";

function TopBar() {
  const navigation = useNavigation();
  return (
    <View style={styles.barContainer}>
      <Text style={styles.logo}>FitCheck</Text>
      <View style={styles.rightRow}>
        {/* <Ionicons name="notifications-outline" size={27} color="#1D1B20" /> */}
        <TouchableOpacity onPress={() => navigation.navigate("Account")}>
           <Image style={styles.userAvatar} source={require("../assets/images/home screen/user-avatar.png")}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    width: "100%",
    height: 44,
    paddingHorizontal: 14,
    justifyContent: "space-between",
    marginBottom: 17,
    alignItems: "flex-end",
    // backgroundColor: colors.accent,
  },
  logo: {
    fontFamily: "higuen",
    fontSize: 32,
    paddingTop: 10
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    // backgroundColor: colors.secondary,
  },
  userAvatar: {
    width: 33,
    height: 33,
    
  },
});

export default TopBar;