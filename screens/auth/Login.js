import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Required Field is Missing", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    const LoginAPIURL = "https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/login.php";
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    const data = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch(LoginAPIURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      console.log('Response Data:', responseData); // Debugging line
      setLoading(false);

      if (responseData.Status) {
        const userData = responseData.userData;

        if (userData) {
          await AsyncStorage.setItem('user', JSON.stringify(userData));
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
      {loading && <Text style={styles.loading}>Loading...</Text>}
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
