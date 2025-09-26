// detail.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppContext } from "./_layout";

export default function Detail() {
  const { id } = useLocalSearchParams(); // task id from navigation
  const router = useRouter();
  const ctx = useContext(AppContext);

  if (!ctx) {
    return (
      <View style={styles.center}>
        <Text>AppContext not found</Text>
      </View>
    );
  }

  const { tasks, toggleComplete, deleteTask } = ctx;
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <View style={styles.center}>
        <Text>Task not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>

      <Text style={styles.label}>
        Status:{" "}
        <Text style={{ fontWeight: "600" }}>
          {task.completed ? "✅ Completed" : "⏳ Pending"}
        </Text>
      </Text>

      {task.dueDate && (
        <Text style={styles.label}>Due: {task.dueDate}</Text>
      )}

      {task.priority && (
        <Text style={styles.label}>Priority: {task.priority}</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => toggleComplete(task.id)}
          style={styles.button}
        >
          <Ionicons
            name={task.completed ? "checkmark-done" : "checkmark-circle"}
            size={20}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {task.completed ? "Mark Incomplete" : "Mark Complete"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            deleteTask(task.id);
            router.back();
          }}
          style={[styles.button, { backgroundColor: "#f44336" }]}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back to Tasks</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 8 },
  actions: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196f3",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  back: { marginTop: 20, color: "#2196f3", fontWeight: "600" },
});
