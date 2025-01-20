import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Required Field is Missing", "Please enter both username and password.");
      return;
    }

    setLoading(true);

    const LoginAPIURL = "http://192.168.43.178/12_18/4Capstone/app/guard/db_connection/guardlogin.php";
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    const data = { username, password };

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
          await AsyncStorage.setItem('sessionKey', userData.sessionKey || ''); // Save sessionKey guard_HO_Very
          navigation.navigate('guard_OTP');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="default"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  loading: {
    marginTop: 16,
    textAlign: 'center',
  },
});

export default LoginScreen;
