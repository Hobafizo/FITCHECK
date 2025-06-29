import { StyleSheet, View, Text } from "react-native";
import LottieView from "lottie-react-native";
import colors from "../assets/colors/colors";
import { useEffect, useState } from "react";
import { useWardrobeStore } from "../store/wardrobeStore";
import { useNavigation } from "@react-navigation/native";

function ProcessingScreen({ route }) {
  const [checkPending, setCheckPending] = useState(false);
  const itemsNumber = route.params.itemsNumber;
  const wardrobeItems = useWardrobeStore((state) => state.wardrobeItems);
  const fetchWardrobe = useWardrobeStore((state) => state.fetchWardrobe);
  const navigation = useNavigation();
  useEffect(() => {
    const fetchData = async () => {
      const hasPending = await fetchWardrobe();
      console.log("hi", hasPending);

      setCheckPending(hasPending);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let interval;
    if (checkPending) {
      console.log("here0");

      interval = setInterval(async () => {
        console.log("hiiiiiiii");

        const stillPending = await fetchWardrobe();
        console.log("hmmmm", stillPending);

        if (!stillPending) {
          setCheckPending(false);
          console.log("here1");
          clearInterval(interval);
          console.log("here222");

          navigation.replace("ItemScreen", {
            isConfirm: true,
            itemIds: wardrobeItems
              .slice(-itemsNumber)
              .map((item) => item.ItemID),
            currentIndex: 0,
          });
        }
      }, 3000); // Call handleFetchData every 3 seconds

      // Cleanup the interval when checkPending becomes false or component unmounts
      return () => clearInterval(interval);
    }
  }, [checkPending]);

  return (
    <View style={styles.lottieScreen}>
      <View style={styles.shadowLayer} />
      <LottieView
        autoPlay
        source={require("../assets/lottifiles/processing1.json")}
        style={styles.lottieFile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lottieScreen: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    inset: 0,
    zIndex: 5,
  },
  shadowLayer: {
    position: "absolute",
    inset: 0,
    backgroundColor: colors.main,
    opacity: 0.8,
  },
  lottieFile: {
    width: "100%",
    aspectRatio: 1,
    zIndex: 10,
    opacity: 1,
  },
});

export default ProcessingScreen;
