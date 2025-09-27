import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Pressable,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import colors from "../assets/colors/colors";
import SectionWrapper from "../components/SectionWrapper";
import ColorItem from "../components/you screen/ColorItem";
import Pill from "../components/you screen/Pill";
import { useNavigation } from "@react-navigation/native";
import { useUserStore } from "../store/userStore";
import { preferencesStore } from "../store/preferencesStore";

function YouScreen() {
  const navigation = useNavigation();
  const {
    selectedSkin,
    selectedStyle,
    selectedColorTone,
    setSelectedSkin,
    setSelectedColorTone,
    setSelectedStyle,
    updateCustomTheme,
  } = preferencesStore();

  useEffect(() => {
    console.log(selectedStyle);
    console.log(selectedColorTone);
    console.log(selectedSkin);
    updateCustomTheme();
  }, [selectedColorTone, selectedSkin, selectedStyle]);

  // const [selectedSkin, setSelectedSkin] = useState("");
  // const [selectedStyle, setSelectedStyle] = useState("Neutral");
  // const [selectedColorTone, setSelectedColorTone] = useState("Neutral");

  const firstName = useUserStore((state) => state.FirstName);
  const removeUser = useUserStore((state) => state.removeUser);

  useEffect(() => {}, [selectedSkin, selectedColorTone, selectedStyle]);

  async function handleLogout(values) {
    console.log(process.env.EXPO_PUBLIC_API_HOST);

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
        removeUser();
        navigation.reset({
          index: 0,
          routes: [{ name: "Auth", params: { screen: "Login" } }],
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top Bar */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>You</Text>
        <Pressable
          style={styles.iconContainer}
          onPress={() => navigation.push("Settings")}
        >
          <Image
            source={require("../assets/images/Youscreen/settings.png")}
            style={styles.settingsIcon}
          />
        </Pressable>
      </View>

      {/* Profile Icon */}
      <View style={styles.profile}>
        <View style={styles.profileImageWrapper}>
          <Image
            source={require("../assets/images/Youscreen/user-avatar.png")}
            style={styles.profileImage}
          />
        </View>

        <View style={styles.editIconWrapper}>
          <Pressable onPress={() => navigation.push("Settings")}>
            <Image
              source={require("../assets/images/Youscreen/edit-icon.png")}
              style={styles.editIcon}
            />
          </Pressable>
        </View>
      </View>

      {/* Username */}
      <Pressable onPress={() => navigation.push("Settings")}>
        <Text style={styles.username}>{firstName}</Text>
      </Pressable>

      {/* Avatar Section */}
      <SectionWrapper title={"Avatar"}>
        <View style={styles.sectionRow}>
          <Text style={styles.rowTitle}>Skin Tone</Text>

          <View style={[styles.rowContent, { gap: 14 }]}>
            <ColorItem
              color={"white"}
              isSelected={selectedSkin == "white"}
              setSelectedSkin={setSelectedSkin}
            />
            <ColorItem
              color={"brown"}
              isSelected={selectedSkin == "brown"}
              setSelectedSkin={setSelectedSkin}
            />
            <ColorItem
              color={"black"}
              isSelected={selectedSkin == "black"}
              setSelectedSkin={setSelectedSkin}
            />
          </View>
        </View>
      </SectionWrapper>

      <SectionWrapper title={"Outfit Preferences"}>
        <View style={styles.sectionRow}>
          <Text style={styles.rowTitle}>Style</Text>
          <View style={[styles.rowContent, { gap: 5 }]}>
            <Pill
              title={"Neutral"}
              isSelected={selectedStyle == "Neutral"}
              setIsSelected={setSelectedStyle}
            />
            <Pill
              title={"Casual"}
              isSelected={selectedStyle == "Casual"}
              setIsSelected={setSelectedStyle}
            />
            <Pill
              title={"Formal"}
              isSelected={selectedStyle == "Formal"}
              setIsSelected={setSelectedStyle}
            />
          </View>
        </View>
        <View style={styles.sectionRow}>
          <Text style={styles.rowTitle}>Color Tone</Text>
          <View style={[styles.rowContent, { gap: 5 }]}>
            <Pill
              title={"Neutral"}
              isSelected={selectedColorTone == "Neutral"}
              setIsSelected={setSelectedColorTone}
            />
            <Pill
              title={"Warm"}
              isSelected={selectedColorTone == "Warm"}
              setIsSelected={setSelectedColorTone}
            />
            <Pill
              title={"Cold"}
              isSelected={selectedColorTone == "Cold"}
              setIsSelected={setSelectedColorTone}
            />
          </View>
        </View>
      </SectionWrapper>
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.button}
          android_ripple={{ color: "rgba(0,0,0,0.1)" }}
          onPress={handleLogout}
        >
          <Text style={styles.buttonTitle}>Log Out</Text>
        </Pressable>
      </View>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 15 + (Platform.OS === "android" ? StatusBar.currentHeight : 0),
    paddingHorizontal: 18,
    backgroundColor: colors.main,
    alignItems: "center",
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 36,
    position: "relative",
    // backgroundColor: "green",
  },
  headerTitle: {
    fontFamily: "higuen",
    fontSize: 30,
  },
  iconContainer: {
    position: "absolute",
    right: 0,
  },
  settingsIcon: {
    height: 28,
    width: 28,
  },
  profile: {
    position: "relative",
    marginBottom: 13,
  },
  profileImageWrapper: {
    borderRadius: "50%",
    backgroundColor: "#1E2E33",
    elevation: 6,
  },
  profileImage: {
    height: 150,
    width: 150,
  },
  editIconWrapper: {
    borderRadius: "50%",
    position: "absolute",
    right: 5,
    bottom: 0,
    elevation: 6,
  },
  editIcon: {
    height: 41,
    width: 41,
  },
  username: {
    fontFamily: "poppins",
    fontSize: 20,
    textDecorationLine: "underline",
    marginBottom: 28,
  },
  sectionRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  rowTitle: {
    // fontFamily: "poppins-medium",
    fontSize: 15,
  },
  rowContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // gap: 14,
  },
  buttonContainer: {
    height: 53,
    marginTop: 20,
    backgroundColor: colors.accent,
    elevation: 6,
    borderRadius: 12,
    overflow: "hidden",
    // width: "100%",
  },
  button: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 120,
  },
  buttonTitle: {
    fontFamily: "poppins-semibold",
    color: "white",
    fontSize: 16,
  },
});

export default YouScreen;
