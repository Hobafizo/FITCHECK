import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Pressable,
  FlatList,
} from "react-native";
import colors from "../assets/colors/colors";
import { useCallback, useEffect, useState } from "react";

import OutfitCard from "../components/OutfitCard";
import { Ionicons } from "@expo/vector-icons";
import { outfitsDummyData } from "../store/data";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useOutfitStore } from "../store/outfitStore";

function OutfitsScreen({ route }) {
  const [isRecent, setIsRecent] = useState(false);
  const [isFavorites, setIsFavorites] = useState(false);
  // const [outfits, setOutfits] = useState(outfitsDummyData);
  const outfits = useOutfitStore((state) => state.outfits);
  const setOutfits = useOutfitStore((state) => state.setOutfits);
  const [filteredOutfits, setFilteredOutfits] = useState([]);

  async function handleFetchData() {
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/outfits",
        {
          method: "GET",
        }
      );

      const data = await res.json();
      if (data.Result == false) {
        console.log("Error", data.Errors[0]);
      } else {
        const groupedOutfits = Object.values(
          data.Outfits.reduce((acc, curr) => {
            const { OutfitID, ItemID, Favorite } = curr;
            if (!acc[OutfitID]) {
              acc[OutfitID] = {
                OutfitID,
                ItemIDs: [],
                Favorite,
              };
            }
            acc[OutfitID].ItemIDs.push(ItemID);
            return acc;
          }, {})
        );

        console.log("hi", groupedOutfits);
        setOutfits(groupedOutfits);
        setFilteredOutfits(groupedOutfits);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    handleFetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      handleFetchData();
    }, [])
  );

  // useEffect(()=>{
  //   if(isFavorites){
  //     const prevOutfits = outfits;
  //   }
  // }, [filteredOutfits, isFavorites])

  const navigation = useNavigation();

  useEffect(() => {
    setIsRecent(route.params?.isRecent || false);
    setIsFavorites(route.params?.isFavorites || false);
  }, [route]);

  function handleFiltering() {
    let filteredList;
    if (isFavorites == true) {
      filteredList = outfits.filter((outfit) => outfit.Favorite === true);
    } else {
      filteredList = outfits;
    }
    // if (isRecent == true && isFavorites == true) {
    //   filteredList = outfits.filter(
    //     (outfit) => outfit.favorites == true && outfit.recent == true
    //   );
    // } else if (isRecent == true) {
    //   filteredList = outfits.filter((outfit) => outfit.recent == true);
    // } else if (isFavorites == true) {
    //   filteredList = outfits.filter((outfit) => outfit.favorites == true);
    // } else {
    //   filteredList = outfits;
    // }
    setFilteredOutfits(filteredList);
  }

  async function handleSetFavorite(values) {
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/setfavorite",
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
        console.error("Error", data.Errors[0]);
      } else {
        toggleFavorite(values.OutfitID);
        console.log("Favorited");
      }
    } catch (error) {
      console.error(error);
    }
  }

  function toggleFavorite(id) {
    console.log(id);

    const prevOutfits = outfits;
    setOutfits(
      prevOutfits.map((outfit) =>
        outfit.OutfitID === id
          ? { ...outfit, Favorite: !outfit.Favorite }
          : outfit
      )
    );
  }

  useEffect(handleFiltering, [isRecent, isFavorites, outfits]);

  return (
    <View style={styles.screen}>
      <View style={styles.filtersBar}>
        <View style={[styles.filter, isRecent && styles.filterSelected]}>
          <Pressable
            style={styles.filterInner}
            onPress={() => setIsRecent((prevIsRecent) => !prevIsRecent)}
          >
            <Text
              style={[styles.filterText, isRecent && styles.filterTextSelected]}
            >
              Recent
            </Text>
          </Pressable>
        </View>
        <View style={[styles.filter, isFavorites && styles.filterSelected]}>
          <Pressable
            style={styles.filterInner}
            onPress={() =>
              setIsFavorites((prevIsFavorites) => !prevIsFavorites)
            }
          >
            <Text
              style={[
                styles.filterText,
                isFavorites && styles.filterTextSelected,
              ]}
            >
              Favorites
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filteredOutfits}
        keyExtractor={(item) => item.OutfitID}
        numColumns={2}
        style={{ width: "100%" }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
          width: "100%",
        }}
        contentContainerStyle={{
          gap: 15,
          paddingTop: 12,
          paddingBottom: 100,
        }}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <OutfitCard
              OutfitID={item.OutfitID}
              onPress={() =>
                navigation.push("OutfitDetails", { OutfitID: item.OutfitID })
              }
            />
            <Pressable
              style={styles.bookmark}
              onPress={() =>
                handleSetFavorite({
                  OutfitID: item.OutfitID,
                  Favorite: !item.Favorite,
                })
              }
            >
              {item.Favorite ? (
                <Ionicons name="bookmark" size={28} color={"#D2A553"} />
              ) : (
                <Ionicons name="bookmark-outline" size={28} />
              )}
            </Pressable>
          </View>
        )}
      />
      <View style={styles.bottomButtonContainer}>
        <View style={styles.bottomButton}>
          <Pressable
            style={styles.bottomButtonInner}
            onPress={() => {
              console.log("here");
              navigation.push("GenertaionScreen");
              console.log("here2");
            }}
          >
            <Text style={styles.bottomButtonText}>Generate</Text>
            <Ionicons
              name="sparkles-sharp"
              color="white"
              size={20}
              style={styles.sparkles}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.main,
    paddingTop: 5,
    alignItems: "center",
    // backgroundColor:"green",
  },
  filtersBar: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    // backgroundColor:"green",
  },
  filter: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#CAC4D0",
    overflow: "hidden",
  },
  filterSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    elevation: 2,
  },
  filterInner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    fontFamily: "inter-medium",
    fontSize: 14,
    color: "#49454F",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  filterTextSelected: {
    color: "white",
  },
  cardWrapper: {
    width: "48%",
    aspectRatio: 1,
    position: "relative",
  },
  bookmark: {
    position: "absolute",
    right: 2,
    bottom: -10,
  },
  bottomButtonContainer: {
    width: "100%",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  bottomButton: {
    borderRadius: 8,
    elevation: 4,
    overflow: "hidden",
    position: "absolute",
    bottom: 20,
    width: "100%",
  },
  bottomButtonInner: {
    backgroundColor: colors.accent,
    paddingVertical: 13,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  bottomButtonText: {
    fontFamily: "higuen",
    fontSize: 24,
    fontStyle: 20,
    color: "white",
    // left:10,
  },
  sparkles: {
    // position: "absolute",
    // right: 120,
    bottom: 7,
  },
});

export default OutfitsScreen;
