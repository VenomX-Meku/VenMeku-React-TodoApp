// profile.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppContext } from "./_layout";

export default function Profile() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    return (
      <View style={styles.center}>
        <Text>AppContext not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <Image
        source={{ uri: "https://i.pravatar.cc/150" }}
        style={styles.avatar}
      />

      {/* User Info */}
      <Text style={styles.name}>John Doe</Text>
      <Text style={styles.email}>johndoe@email.com</Text>

      {/* Settings */}
      <View style={styles.settings}>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="notifications" size={22} color="#555" />
          <Text style={styles.rowText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="color-palette" size={22} color="#555" />
          <Text style={styles.rowText}>Theme</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="lock-closed" size={22} color="#555" />
          <Text style={styles.rowText}>Privacy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="log-out" size={22} color="#f44336" />
          <Text style={[styles.rowText, { color: "#f44336" }]}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: "700" },
  email: { fontSize: 14, color: "#666", marginBottom: 20 },
  settings: { width: "100%", marginTop: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
    gap: 12,
  },
  rowText: { fontSize: 16 },
});
