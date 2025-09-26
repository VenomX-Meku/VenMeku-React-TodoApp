// Layout.tsx
import { Ionicons } from "@expo/vector-icons";
import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View
} from "react-native";

/**
 * Layout component with many features for an Expo Router To-Do app.
 * Place in components/Layout.tsx or app/_layout.tsx (Expo Router).
 */

/* ----------------------------- Types ----------------------------- */
type LayoutProps = {
  children: ReactNode;
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string; // ISO string
  createdAt: number;
};

type AppContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  search: string;
  setSearch: (s: string) => void;
  lang: string;
  setLang: (l: string) => void;
  tasks: Task[];
  addTask: (title: string, opts?: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  filteredCount: number;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

/* ---------------------------- Component --------------------------- */
export default function Layout({ children }: LayoutProps) {
  // THEMES & SETTINGS
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode((v) => !v);

  // CLOCK
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // TASKS (local sample data)
  const [tasks, setTasks] = useState<Task[]>(() => [
    {
      id: "1",
      title: "Buy groceries",
      completed: false,
      priority: "high",
      dueDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1h ago - overdue example
      createdAt: Date.now() - 100000,
    },
    {
      id: "2",
      title: "Walk the dog",
      completed: false,
      priority: "medium",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: Date.now() - 50000,
    },
  ]);

  // TASK COUNTER derived
  const taskCount = tasks.length;

  // QUICK ADD input state
  const [quickAdd, setQuickAdd] = useState("");

  // UNDO / LAST DELETED
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);

  // SNACKBAR
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const snackbarAnim = useRef(new Animated.Value(0)).current;

  const showSnackbar = (text: string, duration = 3500) => {
    setSnackbarText(text);
    setSnackbarVisible(true);
    Animated.timing(snackbarAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    setTimeout(() => {
      Animated.timing(snackbarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start(() => setSnackbarVisible(false));
    }, duration);
  };

  // SEARCH + DEBOUNCE
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<number | null>(null);

  const onChangeSearch = (text: string) => {
    setSearch(text);
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    // debounce 400ms
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(text.trim());
    }, 400) as unknown as number;
  };

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  // LANGUAGE
  const [lang, setLang] = useState("EN");

  // SIDEBAR ANIMATION
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarTranslate = useRef(new Animated.Value(-260)).current;

  useEffect(() => {
    Animated.timing(sidebarTranslate, {
      toValue: sidebarOpen ? 0 : -260,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [sidebarOpen, sidebarTranslate]);

  // SETTINGS modal & font size
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // PROFILE modal
  const [profileOpen, setProfileOpen] = useState(false);

  // SORT & FILTER
  const [sortMode, setSortMode] = useState<"newest" | "oldest" | "priority">(
    "newest"
  );
  const [filterMode, setFilterMode] = useState<"all" | "active" | "completed">(
    "all"
  );
  const [sortOpen, setSortOpen] = useState(false);

  // IMPORT modal
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  // HELP modal
  const [helpOpen, setHelpOpen] = useState(false);

  // SYNC indicator and refreshing
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // simulated refresh / sync
    setTimeout(() => {
      setRefreshing(false);
      showSnackbar("Refreshed");
    }, 1000);
  };

  const onSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      showSnackbar("Sync complete");
    }, 1200);
  };

  // SCROLL ANIMATION for header shrinking
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [84, 56],
    extrapolate: "clamp",
  });
  const headerPadding = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [16, 8],
    extrapolate: "clamp",
  });

  /* --------------------------- Task actions --------------------------- */
  const addTask = (title: string, opts?: Partial<Task>) => {
    if (!title.trim()) {
      showSnackbar("Type a task first");
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      priority: (opts?.priority as Task["priority"]) ?? "low",
      dueDate: opts?.dueDate,
      createdAt: Date.now(),
    };
    setTasks((p) => [newTask, ...p]);
    setQuickAdd("");
    showSnackbar("Task added");
    Vibration.vibrate && Vibration.vibrate(40);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => {
      const found = prev.find((t) => t.id === id) ?? null;
      setLastDeleted(found);
      return prev.filter((t) => t.id !== id);
    });
    showSnackbar("Task deleted — Undo?", 4000);
    Vibration.vibrate && Vibration.vibrate(30);
  };

  const undoDelete = () => {
    if (lastDeleted) {
      setTasks((p) => [lastDeleted!, ...p]);
      setLastDeleted(null);
      showSnackbar("Deleted task restored");
    } else {
      showSnackbar("Nothing to undo");
    }
  };

  const toggleComplete = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  /* --------------------------- Filtering & Sort --------------------------- */
  const filteredTasks = useMemo(() => {
    let arr = tasks.slice();

    // filter
    if (filterMode === "active") arr = arr.filter((t) => !t.completed);
    if (filterMode === "completed") arr = arr.filter((t) => t.completed);

    // search
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      arr = arr.filter((t) => t.title.toLowerCase().includes(s));
    }

    // sort
    if (sortMode === "newest") arr.sort((a, b) => b.createdAt - a.createdAt);
    if (sortMode === "oldest") arr.sort((a, b) => a.createdAt - b.createdAt);
    if (sortMode === "priority")
      arr.sort((a, b) => {
        const pri = { high: 3, medium: 2, low: 1 } as any;
        return pri[b.priority] - pri[a.priority];
      });

    return arr;
  }, [tasks, debouncedSearch, filterMode, sortMode]);

  const filteredCount = filteredTasks.length;

  /* ------------------------------ Export ------------------------------ */
  const exportTasks = async () => {
    try {
      const json = JSON.stringify(tasks, null, 2);
      await Share.share({ message: json });
      showSnackbar("Exported tasks (share dialog)");
    } catch (e) {
      Alert.alert("Export failed", String(e));
    }
  };

  /* ------------------------------ Import ------------------------------ */
  const importTasks = () => {
    try {
      if (!importText.trim()) {
        Alert.alert("Paste JSON to import");
        return;
      }
      const parsed = JSON.parse(importText) as Task[];
      if (!Array.isArray(parsed)) throw new Error("Invalid JSON format");
      // normalize/validate basic fields then prepend
      const normalized = parsed.map((p) => ({
        id: String(p.id ?? Date.now() + Math.random()),
        title: String(p.title ?? "Untitled"),
        completed: Boolean(p.completed),
        priority: (p.priority as Task["priority"]) ?? "low",
        dueDate: p.dueDate,
        createdAt: Number(p.createdAt ?? Date.now()),
      }));
      setTasks((p) => [...normalized, ...p]);
      setImportText("");
      setImportOpen(false);
      showSnackbar(`${normalized.length} tasks imported`);
    } catch (err) {
      Alert.alert("Import error", String(err));
    }
  };

  /* --------------------------- Overdue count -------------------------- */
  const overdueCount = useMemo(() => {
    const now = Date.now();
    return tasks.reduce((acc, t) => {
      if (t.dueDate && !t.completed && new Date(t.dueDate).getTime() < now) return acc + 1;
      return acc;
    }, 0);
  }, [tasks]);

  /* --------------------------- Context value ------------------------- */
  const contextValue: AppContextType = {
    darkMode,
    toggleDarkMode,
    fontSize,
    setFontSize,
    search,
    setSearch: onChangeSearch,
    lang,
    setLang,
    tasks,
    addTask,
    deleteTask,
    toggleComplete,
    filteredCount,
  };

  /* ----------------------------- Render UI --------------------------- */
  return (
    <AppContext.Provider value={contextValue}>
      <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? "#0b0b0b" : "#f3f7fb" }]}>
        {/* Animated Header */}
        <Animated.View
          style={[
            styles.header,
            {
              height: headerHeight,
              paddingTop: headerPadding,
              backgroundColor: darkMode ? "#111" : "#1976d2",
            } as any,
          ]}
        >
          {/* Left: Logo / Title */}
          <View style={styles.headerLeft}>
            <Ionicons name="list" size={28} color="#fff" />
            <Text
              style={[styles.title, { fontSize: fontSize + 2, color: "#fff" }]}
              accessibilityLabel="App title"
            >
              To-Do App
            </Text>
            {overdueCount > 0 && (
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueText}>{overdueCount}</Text>
              </View>
            )}
          </View>

          {/* Right: Controls row */}
          <View style={styles.headerRight}>
            {/* Quick add */}
            <View style={styles.quickAddWrap}>
              <TextInput
                value={quickAdd}
                onChangeText={setQuickAdd}
                placeholder="Quick add..."
                placeholderTextColor={darkMode ? "#bbb" : "#eee"}
                style={[
                  styles.quickAddInput,
                  { backgroundColor: darkMode ? "#222" : "#fff", color: darkMode ? "#fff" : "#000" },
                ]}
                onSubmitEditing={() => addTask(quickAdd)}
                accessibilityLabel="Quick add task"
              />
              <TouchableOpacity
                onPress={() => addTask(quickAdd)}
                style={styles.iconButton}
                accessibilityLabel="Add task"
              >
                <Ionicons name="add-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color="#fff" />
              <TextInput
                value={search}
                onChangeText={onChangeSearch}
                placeholder="Search tasks"
                placeholderTextColor="#eee"
                style={[styles.searchInput, { color: "#fff" }]}
                accessibilityLabel="Search tasks"
              />
            </View>

            {/* Filter chips */}
            <View style={styles.chips}>
              <TouchableOpacity onPress={() => setFilterMode("all")} style={[styles.chip, filterMode === "all" && styles.chipActive]}>
                <Text style={styles.chipText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterMode("active")} style={[styles.chip, filterMode === "active" && styles.chipActive]}>
                <Text style={styles.chipText}>Active</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterMode("completed")} style={[styles.chip, filterMode === "completed" && styles.chipActive]}>
                <Text style={styles.chipText}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Sort */}
            <TouchableOpacity onPress={() => setSortOpen(true)} style={styles.iconButton} accessibilityLabel="Sort tasks">
              <Ionicons name="funnel" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Language */}
            <TouchableOpacity onPress={() => setLang(lang === "EN" ? "AM" : "EN")} style={styles.iconButton} accessibilityLabel="Switch language">
              <Ionicons name="globe" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Sync indicator */}
            <TouchableOpacity onPress={onSync} style={styles.iconButton} accessibilityLabel="Sync tasks">
              {syncing ? <ActivityIndicator color="#fff" /> : <Ionicons name="cloud-upload" size={20} color="#fff" />}
            </TouchableOpacity>

            {/* Dark mode */}
            <TouchableOpacity onPress={() => toggleDarkMode()} style={styles.iconButton} accessibilityLabel="Toggle dark mode">
              <Ionicons name={darkMode ? "sunny" : "moon"} size={20} color="#fff" />
            </TouchableOpacity>

            {/* Sidebar toggle / profile */}
            <TouchableOpacity onPress={() => setSidebarOpen((s) => !s)} style={styles.iconButton} accessibilityLabel="Open menu">
              <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Animated Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: sidebarTranslate }],
              backgroundColor: darkMode ? "#111" : "#fff",
              borderColor: darkMode ? "#222" : "#ddd",
            },
          ]}
        >
          <View style={{ marginTop: 30 }}>
            <TouchableOpacity onPress={() => { setSidebarOpen(false); }}>
              <Text style={[styles.sidebarItem, { fontWeight: "700" }]}>🏠 Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setProfileOpen(true); }}>
              <Text style={styles.sidebarItem}>👤 Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSettingsOpen(true)}>
              <Text style={styles.sidebarItem}>⚙️ Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setImportOpen(true); }}>
              <Text style={styles.sidebarItem}>⬇️ Import tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => exportTasks()}>
              <Text style={styles.sidebarItem}>⬆️ Export tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setHelpOpen(true)}>
              <Text style={styles.sidebarItem}>❓ Help</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main content (ScrollView with pull-to-refresh) */}
        <Animated.ScrollView
          style={styles.mainScroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* small summary row */}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryText, { fontSize }]}>
              Showing <Text style={{ fontWeight: "700" }}>{filteredCount}</Text> tasks • Total <Text style={{ fontWeight: "700" }}>{taskCount}</Text>
            </Text>
            <View style={styles.summaryRight}>
              <TouchableOpacity onPress={() => { setSnackbarText("Quick action"); showSnackbar("Quick action demo"); }} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>Quick</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* children (pages) */}
          <View style={{ marginTop: 12 }}>
            {/* wrap children in a container to allow fontSize usage */}
            <View style={{ minHeight: 300 }}>
              {children}
            </View>
          </View>

          {/* Footer spacer */}
          <View style={{ height: 60 }} />
        </Animated.ScrollView>

        {/* Footer (Bottom bar) */}
        <View style={[styles.footer, { backgroundColor: darkMode ? "#0b0b0b" : "#222" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ color: "#fff" }}>{time.toLocaleTimeString()}</Text>
            <Text style={{ color: "#fff", marginLeft: 12 }}>{lang}</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: "#fff", fontSize: 12 }}>© {new Date().getFullYear()} To-Do App</Text>
            <Text style={{ color: "#fff", marginLeft: 12, fontSize: 12 }}>{taskCount} total</Text>
          </View>
        </View>

        {/* -------------------- Sort modal -------------------- */}
        <Modal visible={sortOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modal, { backgroundColor: darkMode ? "#111" : "#fff" }]}>
              <Text style={[styles.modalTitle, { fontSize }]}>Sort tasks</Text>
              <TouchableOpacity onPress={() => { setSortMode("newest"); setSortOpen(false); }} style={styles.modalItem}>
                <Text>Newest</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSortMode("oldest"); setSortOpen(false); }} style={styles.modalItem}>
                <Text>Oldest</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSortMode("priority"); setSortOpen(false); }} style={styles.modalItem}>
                <Text>Priority</Text>
              </TouchableOpacity>
              <Pressable onPress={() => setSortOpen(false)} style={styles.modalClose}>
                <Text>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* -------------------- Settings modal -------------------- */}
        <Modal visible={settingsOpen} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modal, { backgroundColor: darkMode ? "#111" : "#fff" }]}>
              <Text style={[styles.modalTitle, { fontSize }]}>Settings</Text>
              <View style={{ marginVertical: 8 }}>
                <Text>Font size</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <TouchableOpacity onPress={() => setFontSize((f) => Math.max(12, f - 1))} style={styles.smallButton}>
                    <Text style={styles.smallButtonText}>A-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setFontSize((f) => Math.min(30, f + 1))} style={styles.smallButton}>
                    <Text style={styles.smallButtonText}>A+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Pressable onPress={() => setSettingsOpen(false)} style={styles.modalClose}>
                <Text>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* -------------------- Profile modal -------------------- */}
        <Modal visible={profileOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modal, { alignItems: "center", backgroundColor: darkMode ? "#111" : "#fff" }]}>
              <View style={{ height: 72, width: 72, borderRadius: 36, backgroundColor: "#666", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Text style={{ color: "#fff", fontSize: 28 }}>MK</Text>
              </View>
              <Text style={{ fontWeight: "700", marginBottom: 8 }}>Mekuanint</Text>
              <Text style={{ marginBottom: 12 }}>example@you.app</Text>
              <TouchableOpacity onPress={() => { setProfileOpen(false); showSnackbar("Signed out (demo)"); }} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>Sign out</Text>
              </TouchableOpacity>

              <Pressable onPress={() => setProfileOpen(false)} style={styles.modalClose}>
                <Text>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* -------------------- Import modal -------------------- */}
        <Modal visible={importOpen} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modal, { backgroundColor: darkMode ? "#111" : "#fff" }]}>
              <Text style={[styles.modalTitle, { fontSize }]}>Import tasks (paste JSON)</Text>
              <TextInput
                value={importText}
                onChangeText={setImportText}
                style={[styles.importInput, { color: darkMode ? "#fff" : "#000", backgroundColor: darkMode ? "#222" : "#f4f4f4" }]}
                placeholder="Paste tasks JSON here"
                placeholderTextColor="#999"
                multiline
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                <TouchableOpacity onPress={importTasks} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Import</Text>
                </TouchableOpacity>
                <Pressable onPress={() => setImportOpen(false)} style={styles.modalClose}>
                  <Text>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* -------------------- Help modal -------------------- */}
        <Modal visible={helpOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modal, { backgroundColor: darkMode ? "#111" : "#fff" }]}>
              <Text style={[styles.modalTitle, { fontSize }]}>Tips & Help</Text>
              <Text style={{ marginTop: 8, marginBottom: 12 }}>
                • Quick-add lets you add tasks fast.{"\n"}
                • Use filter chips to see active or done tasks.{"\n"}
                • Export to share your tasks as JSON.
              </Text>
              <Pressable onPress={() => setHelpOpen(false)} style={styles.modalClose}>
                <Text>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* -------------------- Snackbar -------------------- */}
        {snackbarVisible && (
          <Animated.View
            style={[
              styles.snackbar,
              {
                transform: [
                  {
                    translateY: snackbarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [80, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={{ color: "#fff", flex: 1 }}>{snackbarText}</Text>
            {lastDeleted && (
              <TouchableOpacity onPress={undoDelete} style={{ paddingHorizontal: 8 }}>
                <Text style={{ color: "#ffd", fontWeight: "700" }}>UNDO</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </SafeAreaView>
    </AppContext.Provider>
  );
}

/* ----------------------------- Styles ----------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    width: "100%",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    zIndex: 30,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: "#fff", fontWeight: "700", marginLeft: 8 },
  overdueBadge: {
    marginLeft: 8,
    backgroundColor: "#ff4d4f",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  overdueText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  quickAddWrap: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  quickAddInput: {
    height: 36,
    minWidth: 120,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  iconButton: {
    padding: 6,
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  searchInput: { minWidth: 100, marginLeft: 6, height: 28, padding: 0 },
  chips: { flexDirection: "row", gap: 8, marginLeft: 8 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  chipActive: { backgroundColor: "rgba(255,255,255,0.14)" },
  chipText: { color: "#fff", fontSize: 12 },

  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 260,
    height: "100%",
    zIndex: 40,
    padding: 16,
    borderRightWidth: 1,
  },
  sidebarItem: { fontSize: 16, marginVertical: 12 },

  mainScroll: { flex: 1, zIndex: 1 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  summaryText: { color: "#333" },
  summaryRight: { flexDirection: "row", alignItems: "center" },
  smallButton: { backgroundColor: "#1976d2", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  smallButtonText: { color: "#fff", fontWeight: "700" },

  footer: { height: 52, width: "100%", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, flexDirection: "row" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
  modal: { width: "90%", maxWidth: 520, padding: 16, borderRadius: 12 },
  modalTitle: { fontWeight: "700", marginBottom: 12 },
  modalItem: { paddingVertical: 12 },
  modalClose: { marginTop: 12, alignSelf: "flex-end" },

  importInput: { minHeight: 120, borderRadius: 8, padding: 8 },

  snackbar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 24,
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 9999,
  },
});
