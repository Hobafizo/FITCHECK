import { View, StyleSheet, Text, FlatList, Pressable } from "react-native";
import { useWardrobeStore } from "../store/wardrobeStore";
import ItemCard from "../components/ItemCard";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import colors from "../assets/colors/colors";

function SelectItemScreen() {
  const wardrobeItems = useWardrobeStore((state) => state.wardrobeItems);
  const navigation = useNavigation();
  const route = useRoute();
  const onSelect = route.params?.onSelect;

  useEffect(() => {
    console.log("here: ", wardrobeItems.length);
  }, []);
  return (
    <View style={styles.screen}>
      <FlatList
        style={{ width: "100%" }}
        data={wardrobeItems}
        numColumns={2}
        keyExtractor={(item) => item.ItemID}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
          width: "100%",
        }}
        contentContainerStyle={{
          gap: 15,
          paddingTop: 12,
          paddingBottom: 20,
        }}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.imageBox}>
              <ItemCard
                img={{
                  uri: item.localImageUri,
                }}
                onPress={() => {
                  if (onSelect) onSelect(item.ItemID);
                  navigation.goBack();
                }}
              />
            </View>
            <Text style={styles.itemBrand}>{item.BrandName || "Brand "}</Text>
            <Text style={styles.itemName}>{item.ItemName || "Item Name"}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.main,
    paddingTop: 10,
    alignItems: "center",
  },
  itemCard: {
    width: "48%",
    gap: 3,
  },
  imageBox: {
    width: "100%",
    aspectRatio: 1,
  },
  itemBrand: {
    fontFamily: "inter-medium",
    fontSize: 12,
    // lineHeight: 20,
    color: "#878787",
    paddingLeft: 3,
  },
  itemName: {
    fontFamily: "inter-medium",
    fontSize: 15,
    lineHeight: 16,
    paddingLeft: 3,

    // backgroundColor: "green",
  },
});

export default SelectItemScreen;
