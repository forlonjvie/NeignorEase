import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import md5 from 'md5';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Required Field is Missing", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    const LoginAPIURL = "https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/login.php";
    //const LoginAPIURL = "https://srv1823-files.hstgr.io/8e20dca8ee2ce4d6/files/public_html/app/db_connection/login.php";
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    const hashedPassword = md5(password);
    const data = { email, password: hashedPassword };

    try {
      const response = await fetch(LoginAPIURL, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      setLoading(false);

      if (responseData.Status) {
        const userData = responseData.userData;

        if (userData) {
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          await AsyncStorage.setItem('sessionKey', userData.sessionKey || '');
          navigation.navigate('Home');
        } else {
          Alert.alert("Login Failed", "User data is missing.");
        }
      } else {
        Alert.alert("Login Failed", responseData.Message);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "An error occurred: " + error.message);
    }
  };

  const navigateToSignUp = () => {
    navigation.navigate('Create');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo2.png')} style={styles.logo} />

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.inputPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#888"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpButton} onPress={navigateToSignUp}>
          <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  logo: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    marginBottom: 50,
    marginTop: 100,
  },
  formContainer: {
    backgroundColor: 'rgba(29,87,68,255)',
    borderRadius: 15,
    padding: 20,
    paddingVertical: 30,
    height: 400,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  inputPassword: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    borderRadius: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  loginButton: {
    backgroundColor: 'rgba(0,148,68,255)',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LoginScreen;
