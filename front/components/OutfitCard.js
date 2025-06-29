import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import Card from "./Card";

import { useOutfitStore } from "../store/outfitStore";
import { useWardrobeStore } from "../store/wardrobeStore";

function OutfitCard({ OutfitID, onPress, items = [] }) {
  const [outfitItems, setOutfitItems] = useState([]); // default to empty array
  const wardrobeItems = useWardrobeStore((state) => state.wardrobeItems);
  const getOutfit = useOutfitStore((state) => state.getOutfit);
  const currentOutfit = getOutfit(OutfitID);

  useEffect(() => {
    if (currentOutfit && wardrobeItems.length > 0) {
      setOutfitItems(
        currentOutfit.ItemIDs.map(
          (id) =>
            wardrobeItems.find((item) => item.ItemID === id)?.localImageUri
        )
      );
    } else {
      setOutfitItems(items.map((item) => item?.localImageUri));
    }
  }, [currentOutfit, wardrobeItems]);

  return (
    <View style={styles.container}>
      <Card onPress={onPress}>
        <View style={styles.leftContainer}>
          <View style={styles.smallBox}>
            <Image
              style={styles.img}
              source={outfitItems[0] ? { uri: outfitItems[0] } : undefined}
            />
          </View>
          <View style={styles.smallBox}>
            <Image
              style={styles.img}
              source={outfitItems[1] ? { uri: outfitItems[1] } : undefined}
            />
          </View>
        </View>

        <View style={styles.rightContainer}>
          <Image
            style={styles.img}
            source={outfitItems[2] ? { uri: outfitItems[2] } : undefined}
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%", //160
    width: "100%",
  },
  leftContainer: {
    flexDirection: "column",
    flex: 1,
    justifyContent: "space-between",
  },
  rightContainer: {
    flex: 1,
  },
  smallBox: {
    flex: 1,
  },
  img: {
    objectFit: "contain",
    height: "100%",
    width: "100%,",
  },
});

export default OutfitCard;
