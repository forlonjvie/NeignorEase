import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [hnum, setHnum] = useState('');
  const [con_num, setConNum] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { username } = JSON.parse(userData);
          const response = await axios.get(`https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getuser.php?username=${username}`);
          if (!response.data.error) {
            setUser(response.data);
            setFname(response.data.fname);
            setLname(response.data.lname);
            setEmail(response.data.email);
            setHnum(response.data.hnum);
            setConNum(response.data.con_num);
            setImage(response.data.ho_pic); // Set initial image from the database
          } else {
            console.error("User not found");
            navigation.navigate('Login');
          }
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error("Failed to get user data:", error);
        navigation.navigate('Login');
      }
    };
    getUserData();
  }, [navigation]);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSaveChanges = async () => {
    if (!fname || !lname || !email || !hnum || !con_num) {
      Alert.alert("Required Field is Missing", "Please fill all fields.");
      return;
    }

    const formData = new FormData();
    formData.append('fname', fname);
    formData.append('lname', lname);
    formData.append('email', email);
    formData.append('hnum', hnum);
    formData.append('con_num', con_num);
    formData.append('username', user.username);

    if (password) {
      formData.append('password', password);
    }

    if (image) {
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('ho_pic', {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    setLoading(true);
    try {
      const response = await axios.post('https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/updateprofile.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLoading(false);

      if (response.data.success) {
        Alert.alert("Success", "Profile updated successfully!");
        navigation.navigate('Profile');
      } else {
        Alert.alert("Update Failed", response.data.message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "An error occurred while updating the profile.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>

        {image && (
          <Image source={{ uri: image }} style={styles.image} />
        )}
        <TouchableOpacity onPress={handlePickImage} style={styles.imagePickerButton}>
          <Text style={styles.imagePickerText}>Choose Image</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="First Name"
          value={fname}
          onChangeText={setFname}
          style={styles.input}
        />
        <TextInput
          placeholder="Last Name"
          value={lname}
          onChangeText={setLname}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="House Number"
          value={hnum}
          onChangeText={setHnum}
          style={styles.input}
        />
        <TextInput
          placeholder="Contact Number"
          value={con_num}
          onChangeText={setConNum}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry={true}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fafafa',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
