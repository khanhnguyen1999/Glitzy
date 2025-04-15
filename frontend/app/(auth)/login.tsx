import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingsStore } from "@/store/settingsStore";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Mail, Lock } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoadingUser: isLoadingUser } = useAuthStore();
  const { colors } = useSettingsStore();
  const [loginError, setLoginError] = useState<{message: string} | null>(null);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter your username");
      return;
    }
    
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }
    
    try {
      await login({username, password});
      // No need to navigate here as the AuthContext will handle redirection
    } catch (error) {
      setLoginError({ message: error instanceof Error ? error.message : 'Login failed. Please try again.' });
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }}
              style={styles.logo}
            />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue</Text>
          
          <View style={styles.form}>
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={colors.textSecondary} />}
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
            />
            
            {loginError && (
              <Text style={[styles.errorText, { color: colors.error }]}>{loginError.message}</Text>
            )}
            
            <TouchableOpacity 
              style={styles.forgotPassword}
            //   onPress={() => router.push("/auth/forgot-password")}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoadingUser}
              style={styles.loginButton}
              size="large"
            />
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={[styles.signupText, { color: colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontWeight: "600",
  },
  loginButton: {
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    marginRight: 4,
  },
  signupText: {
    fontWeight: "600",
  },
  demoContainer: {
    marginTop: 40,
    padding: 16,
    borderRadius: 12,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  demoText: {
    marginBottom: 4,
  },
});