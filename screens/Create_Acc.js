import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const RegisterHomeOwner = () => {
  const [username, setUsername] = useState('');
  const [Fname, setFname] = useState('');
  const [Lname, setLname] = useState('');
  const [hnum, setHnum] = useState('');
  const [con_num, setConNum] = useState('');
  const [email, setEmail] = useState('');
  const [mid_ini, setMidIni] = useState('');
  const [password, setPassword] = useState('');
  const [ho_picUri, setHoPicUri] = useState(null);
  const navigation = useNavigation();

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setHoPicUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!username || !Fname || !Lname || !hnum || !con_num || !email || !password) {
      Alert.alert('Validation Error', 'Please fill out all required fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('Fname', Fname);
      formData.append('Lname', Lname);
      formData.append('hnum', hnum);
      formData.append('con_num', con_num);
      formData.append('email', email);
      formData.append('mid_ini', mid_ini);
      formData.append('password', password);

      if (ho_picUri) {
        const filename = ho_picUri.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;
        formData.append('ho_pic', {
          uri: ho_picUri,
          name: filename,
          type,
        });
      }
      //const response = await fetch('https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/register_process.php', {
      const response = await fetch('https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/register_process.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const jsonResponse = await response.json();
      if (jsonResponse.success) {
        Alert.alert('Success', 'Homeowner registered successfully!');
        setUsername('');
        setFname('');
        setLname('');
        setHnum('');
        setConNum('');
        setEmail('');
        setMidIni('');
        setPassword('');
        setHoPicUri(null);
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', jsonResponse.message);
      }
    } catch (error) {
      console.error("Error registering homeowner:", error.message);
      Alert.alert('Error', 'Error registering homeowner: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/house.jpg')} style={styles.banner} />

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>Homeowner Registration</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          onChangeText={setUsername}
          value={username}
        />

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter first name"
          onChangeText={setFname}
          value={Fname}
        />

        <Text style={styles.label}>Middle Initial</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter middle initial"
          onChangeText={setMidIni}
          value={mid_ini}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter last name"
          onChangeText={setLname}
          value={Lname}
        />

        <Text style={styles.label}>House Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter house number"
          onChangeText={setHnum}
          value={hnum}
        />

        <Text style={styles.label}>Contact Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter 10 digits, 9xxxxxxxxx"
          onChangeText={setConNum}
          value={con_num}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        {ho_picUri && (
          <Image source={{ uri: ho_picUri }} style={styles.image} />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Register Homeowner</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handlePickImage}>
        <Icon name="add-a-photo" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  banner: {
    width: '100%',
    height: 150,
    resizeMode: 'cover', // Adjusts the image to cover the width
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgba(29,87,68,255)', // Main title color
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0,148,68,255)', // Label color
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#ecf0f1',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: 'rgba(0,148,68,255)', // Submit button color
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#27ae60',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default RegisterHomeOwner;
