import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import colors from "../assets/colors/colors";
import FilterPill from "../components/FilterPill";
import Pill from "../components/you screen/Pill";
import OutfitCard from "../components/OutfitCard";

import { outfitsDummyData } from "../store/data";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useWardrobeStore } from "../store/wardrobeStore";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

function GeneratedOutfitScreen({ route }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generatedOutfits, setGeneratedOutfits] = useState([]);
  const [rate, setRate] = useState(-1);
  const [outfitColors, setOutfitColors] = useState([]);
  const wardrobeItems = useWardrobeStore((state) => state.wardrobeItems);
  const { suggestions, tags } = route.params;

  const handleRate = async (values) => {
    console.log("Hi: ", values);

    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/rate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data = await res.json();

      if (data.Result == false) {
        // showToast("Error", data.Errors[0]);
        console.log("Error", data.Errors[0]);
      } else {
        console.log("heyy: ", data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (values) => {
    console.log("ex: ", values);
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/saveoutfit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data = await res.json();

      if (data.Result == false) {
        // showToast("Error", data.Errors[0]);
        console.log("Error", data.Errors[0]);
      } else {
        console.log("heyy: ", data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // const getItem = useWardrobeStore((state) => state.getItem);

  // console.log({ suggestions });

  useEffect(() => {
    const grouped = new Map();
    suggestions.forEach(({ SugID, ItemID }) => {
      if (!grouped.has(SugID)) {
        grouped.set(SugID, { SugID, items: [], isSaved: false });
      }
      const item = wardrobeItems.find((i) => i.ItemID === ItemID);
      if (
        item &&
        !grouped.get(SugID).items.some((i) => i.ItemID === item.ItemID)
      ) {
        grouped.get(SugID).items.push(item);
      }
    });

    const seen = new Set();
    const uniqueOutfits = [];
    for (const outfit of grouped.values()) {
      const key = outfit.items
        .map((i) => i.ItemID)
        .sort()
        .join("-");
      if (!seen.has(key)) {
        seen.add(key);
        uniqueOutfits.push(outfit);
      }
    }

    setGeneratedOutfits(uniqueOutfits);
  }, [suggestions, wardrobeItems]);

  // console.log(generatedOutfits[0]);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.max(Math.round(scrollPosition / width));
    if (index !== currentIndex) {
      setCurrentIndex(index);
      console.log("Current index: ", index);
      console.log("HI: ", generatedOutfits[currentIndex].items);
    }
  };

  const toggleSave = () => {
    if (!generatedOutfits[currentIndex]?.isSaved) {
      handleSave({ SugID: generatedOutfits[currentIndex]?.SugID });
    }
    setGeneratedOutfits((prevOutfits) => {
      const updated = [...prevOutfits];
      updated[currentIndex] = {
        ...updated[currentIndex],
        isSaved: !updated[currentIndex].isSaved,
      };
      return updated;
    });
  };

  const getOutfitColors = () => {
    const uniqueColors = [
      ...new Set(
        generatedOutfits[currentIndex]?.items
          .map((item) => item?.Color)
          .filter((color) => color !== undefined)
      ),
    ];
    // console.log({ uniqueColors });
    setOutfitColors(uniqueColors);
  };

  useEffect(() => {
    getOutfitColors();
    console.log("LOOK!!: ", generatedOutfits[currentIndex]?.SugID);
  }, [currentIndex, generatedOutfits]);

  const navigation = useNavigation();

  return (
    <View style={styles.screen}>
      {tags.length != 0 && (
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags: </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillStyles}
          >
            {tags.map((tag, index) => (
              <Pill
                key={`${tag}-${index}`}
                title={tag}
                isSelected={true}
                setIsSelected={() => {}}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {generatedOutfits.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, color: "#888", textAlign: "center" }}>
            No outfits could be generated with your current wardrobe and
            preferences.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.scrollViewWrapper}>
            <ScrollView
              horizontal
              contentContainerStyle={[styles.scrollView, { flexGrow: 1 }]}
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              snapToInterval={width * 0.9 + 11.5 / 2}
              decelerationRate="fast"
            >
              {generatedOutfits.map((outfit) => {
                return (
                  <View key={outfit.SugID} style={styles.cardWrapper}>
                    <OutfitCard items={outfit?.items} />
                  </View>
                );
              })}
            </ScrollView>
          </View>
          <View style={styles.colorsSection}>
            <Text style={styles.sectionTitle}>Colors: </Text>
            {outfitColors.map((color) => (
              <View
                key={`${color}-${currentIndex}`}
                style={[styles.color, { backgroundColor: "#" + color }]}
              />
            ))}
            {/* <View style={[styles.color, { backgroundColor: "#878787" }]} /> */}
          </View>
          <View style={styles.buttonsContainer}>
            <View style={styles.buttonWrapper}>
              <Pressable
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: generatedOutfits[currentIndex]?.isSaved
                      ? "black"
                      : colors.accent,
                  },
                ]}
                android_ripple={{ color: "rgba(0,0,0,0.1)" }}
                onPress={toggleSave}
              >
                <Text style={styles.buttonText}>
                  {generatedOutfits[currentIndex]?.isSaved ? "Unsave" : "Save"}
                </Text>
              </Pressable>
            </View>
            <View style={styles.miniButtonWrapper}>
              <Pressable
                style={styles.dislikeButton}
                onPress={() => {
                  setRate(0);
                  handleRate({
                    SugID: generatedOutfits[currentIndex].SugID,
                    Rate: 0,
                  });
                }}
              >
                <Ionicons
                  name={rate === 0 ? "thumbs-down" : "thumbs-down-outline"}
                  size={30}
                  color={"white"}
                />
              </Pressable>
            </View>
            <View style={styles.miniButtonWrapper}>
              <Pressable
                style={styles.likeButton}
                onPress={() => {
                  setRate(1);
                  handleRate({
                    SugID: generatedOutfits[currentIndex].SugID,
                    Rate: 1,
                  });
                }}
              >
                <Ionicons
                  name={rate === 1 ? "thumbs-up" : "thumbs-up-outline"}
                  size={30}
                  color={"white"}
                />
              </Pressable>
            </View>

            {/* <View style={styles.buttonWrapper}>
              <Pressable
                style={styles.rerunButton}
                android_ripple={{ color: "rgba(0,0,0,0.1)" }}
              >
                <Text style={styles.buttonText}>Rerun</Text>
              </Pressable>
            </View> */}
          </View>
        </>
      )}

      <Pressable onPress={() => navigation.pop()}>
        <Text style={styles.changePreferencesButton}>
          Change Generation Preferences
        </Text>
      </Pressable>
      <View style={styles.noteWrapper}>
        <Text style={styles.note}>
          Some preferences will be discarded if no wardrobe items match.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.main,
    paddingTop: 20,
    alignContent: "center",
  },
  tagsSection: {
    paddingLeft: 16,
    flexDirection: "row",
    gap: 4,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  pillStyles: {
    gap: 5,
    paddingVertical: 8,
    alignItems: "center",
    // flexWrap: "wrap",
    paddingRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: "black",
    fontFamily: "inter-medium",
  },
  scrollViewWrapper: {
    marginTop: 20,
    marginVertical: 20,
    // backgroundColor: "green",
  },
  scrollView: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 16,
    gap: 11.5,
    // backgroundColor: "green",
  },
  cardWrapper: {
    width: width * 0.9,
    aspectRatio: 1,
  },
  colorsSection: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 16,
  },
  color: {
    width: 27,
    height: 27,
    backgroundColor: "black",
    borderRadius: 12,
    elevation: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 30,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  rerunButton: {
    flex: 1,
    backgroundColor: colors.pineGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWrapper: {
    flex: 3,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonText: {
    fontSize: 24,
    color: "white",
    fontFamily: "higuen",
  },
  miniButtonWrapper: {
    height: "60",
    aspectRatio: 1,
    borderRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  likeButton: {
    flex: 1,
    backgroundColor: "#0a6a22",
    justifyContent: "center",
    alignItems: "center",
  },
  dislikeButton: {
    flex: 1,
    backgroundColor: "#de0e34",
    justifyContent: "center",
    alignItems: "center",
  },

  changePreferencesButton: {
    textAlign: "center",
    lineHeight: 60,
    fontSize: 13,
    color: "#888888",
    fontFamily: "inter",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  noteWrapper: {
    width: "100%",
    // position: "absolute",
    // bottom: 10,
    // marginTop: 55,
    // backgroundColor: "red",
  },
  note: {
    textAlign: "center",
    lineHeight: 60,
    fontSize: 10,
    color: "#888888",
    fontFamily: "inter",
  },
});

export default GeneratedOutfitScreen;
