// index.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppContext } from "./_layout"; // or "../components/Layout" if Layout is in components/

export default function Index() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    return (
      <View style={styles.center}>
        <Text>AppContext not found</Text>
      </View>
    );
  }

  const { tasks, toggleComplete, deleteTask, filteredCount } = ctx;

  return (
    <View style={styles.container}>
      {/* Title Row */}
      <Text style={styles.heading}>My Tasks ({filteredCount})</Text>

      {/* Task List */}
      {tasks.length === 0 ? (
        <Text style={styles.empty}>No tasks yet. Add one!</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskRow}>
              <TouchableOpacity
                onPress={() => toggleComplete(item.id)}
                style={styles.taskLeft}
              >
                <Ionicons
                  name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={item.completed ? "#4caf50" : "#999"}
                />
                <Text
                  style={[
                    styles.taskText,
                    item.completed && styles.taskDone,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Ionicons name="trash" size={20} color="#f44336" />
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: "#eee" }} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  empty: {
    marginTop: 40,
    textAlign: "center",
    color: "#777",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  taskLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  taskText: { fontSize: 16 },
  taskDone: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
