import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
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
import { User, Mail, Lock, ArrowLeft } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";

export default function SignupScreen() {
  const router = useRouter();
  const { register, isLoadingUser: isLoadingUser } = useAuthStore();
  const { colors } = useSettingsStore();
  const [registerError, setRegisterError] = useState<{message: string} | null>(null);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleSignup = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter your first name");
      return;
    }
    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter your last name");
      return;
    }
    
    if (!password.trim()) {
      Alert.alert("Error", "Please enter a password");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    
    try {
      await register({username, firstName, lastName, password});
      // No need to navigate here as the AuthContext will handle redirection
    } catch (error) {
      setRegisterError({ message: error instanceof Error ? error.message : 'Registration failed. Please try again.' });
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign up to get started</Text>
          
          <View style={styles.form}>
            <Input
              label="User Name"
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              leftIcon={<User size={20} color={colors.textSecondary} />}
            />
            
            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
              leftIcon={<User size={20} color={colors.textSecondary} />}
            />

            <Input
              label="Last Name"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
              leftIcon={<User size={20} color={colors.textSecondary} />}
            />
            
            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
            />
            
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
            />
            
            {registerError && (
              <Text style={[styles.errorText, { color: colors.error }]}>{registerError.message}</Text>
            )}
            
            <Button
              title="Sign Up"
              onPress={handleSignup}
              loading={isLoadingUser}
              style={styles.signupButton}
              size="large"
            />
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={[styles.loginText, { color: colors.primary }]}>Sign In</Text>
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
  backButton: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 8,
  },
  signupButton: {
    width: "100%",
    marginTop: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    marginRight: 4,
  },
  loginText: {
    fontWeight: "600",
  },
});