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


import { 

  TextInput, 

} from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { ArrowLeft, Eye, EyeOff, Plane } from 'lucide-react-native';


export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoadingUser: isLoadingUser } = useAuthStore();
  const { colors } = useSettingsStore();
  const [loginError, setLoginError] = useState<{message: string} | null>(null);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  
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

  const handleForgotPassword = () => {
    // showNotification('Password reset feature coming soon', 'info');
  };
  
  const handleSocialLogin = (provider: string) => {
    // showNotification(`${provider} login coming soon`, 'info');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors?.text} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Login</Text>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Plane size={40} color="#1A1A1A" />
            </View>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="username"
                value={username}
                onChangeText={setUsername}
                keyboardType="default"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors?.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors?.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Google')}
            >
              <View style={styles.socialIconContainer}>
                <Text style={styles.socialIcon}>G</Text>
              </View>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 100,
    height: 100,
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: colors.textSecondary,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 30,
    padding: 16,
    marginBottom: 16,
  },
  socialIconContainer: {
    marginRight: 10,
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: colors.textSecondary,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});