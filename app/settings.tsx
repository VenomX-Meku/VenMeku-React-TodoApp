// app/settings.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppContext } from "./_layout";

export default function SettingsScreen() {
  const ctx = useContext(AppContext);

  // Local-only states
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [reminders, setReminders] = useState(false);

  if (!ctx) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>⚠️ Context not found</Text>
      </SafeAreaView>
    );
  }

  const {
    darkMode,
    toggleDarkMode,
    fontSize,
    setFontSize,
    lang,
    setLang,
  } = ctx;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#111" : "#f9f9f9" },
      ]}
    >
      <Text style={[styles.header, { color: darkMode ? "#fff" : "#000" }]}>
        ⚙️ Settings
      </Text>

      {/* Dark Mode */}
      <View style={styles.row}>
        <Ionicons
          name={darkMode ? "moon" : "sunny"}
          size={22}
          color={darkMode ? "#fff" : "#333"}
        />
        <Text style={[styles.label, { color: darkMode ? "#fff" : "#000" }]}>
          Dark Mode
        </Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      {/* Font Size */}
      <View style={styles.row}>
        <Ionicons name="text" size={22} color={darkMode ? "#fff" : "#333"} />
        <Text style={[styles.label, { color: darkMode ? "#fff" : "#000" }]}>
          Font Size ({fontSize})
        </Text>
        <View style={styles.fontButtons}>
          <TouchableOpacity
            onPress={() => setFontSize(Math.max(12, fontSize - 1))}
            style={styles.btn}
          >
            <Text style={styles.btnText}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFontSize(Math.min(30, fontSize + 1))}
            style={styles.btn}
          >
            <Text style={styles.btnText}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language */}
      <View style={styles.row}>
        <Ionicons name="globe" size={22} color={darkMode ? "#fff" : "#333"} />
        <Text style={[styles.label, { color: darkMode ? "#fff" : "#000" }]}>
          Language ({lang})
        </Text>
        <TouchableOpacity
          onPress={() => setLang(lang === "EN" ? "AM" : "EN")}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{lang === "EN" ? "Switch to AM" : "Switch to EN"}</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <View style={styles.row}>
        <Ionicons
          name="notifications"
          size={22}
          color={darkMode ? "#fff" : "#333"}
        />
        <Text style={[styles.label, { color: darkMode ? "#fff" : "#000" }]}>
          Notifications
        </Text>
        <Switch value={notifications} onValueChange={setNotifications} />
      </View>

      {/* Sounds */}
      <View style={styles.row}>
        <Ionicons
          name="volume-high"
          size={22}
          color={darkMode ? "#fff" : "#333"}
        />
        <Text style={[styles.label, { color: darkMode ? "#fff" : "#000" }]}>
          Sounds
        </Text>
        <Switch value={sounds} onValueChange={setSounds} />
      </View>

      {/* Auto-Sync */}
      <View style={styles.row}>
        <Ionicons
          name="sync"
          size={22}
          color={darkMode ? "#fff" : "#333"}
        />
        <Text style={[styles.label, { color: darkMode ? "#fff" : "#000" }]}>
          Auto-Sync
        </Text>
        <Switch value={autoSync} onValueChange={setAutoSync} />
      </View>

      {/* Reminders */}
      <View style={styles.row}>
        <Ionicons
          name="alarm"
          size={22}
          color={darkMode ? "#fff" : "#333"}
        />
        <Text style={[styles.label, { color: darkMode ? "#fff" : "#000" }]}>
          Reminders
        </Text>
        <Switch value={reminders} onValueChange={setReminders} />
      </View>

      {/* Privacy */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => Alert.alert("🔒 Privacy", "Privacy settings screen...")}
      >
        <Ionicons
          name="lock-closed"
          size={22}
          color={darkMode ? "#fff" : "#333"}
        />
        <Text style={[styles.label, { color: darkMode ? "#fff" : "#000" }]}>
          Privacy
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    justifyContent: "space-between",
  },
  label: { fontSize: 16, flex: 1, marginLeft: 12 },
  fontButtons: { flexDirection: "row", gap: 8 },
  btn: {
    backgroundColor: "#1976d2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  errorText: { fontSize: 16, color: "red" },
});
