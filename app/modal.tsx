// modal.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Modal() {
  const router = useRouter();

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Quick Action</Text>
        <Text style={styles.message}>
          This is a reusable modal. You can use it for confirmations, tips, or
          quick settings.
        </Text>

        {/* Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#4caf50" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#f44336" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  message: { fontSize: 15, color: "#444", marginBottom: 20 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
