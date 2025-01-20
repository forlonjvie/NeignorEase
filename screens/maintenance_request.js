import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

const BlogForm = () => {
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [title, setTitle] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };
    fetchUserData();
  }, []);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !user || !user.username) {
      Alert.alert('Validation Error', 'Please fill out all fields and ensure you are logged in.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('username', user.username);

      if (imageUri) {
        const filename = imageUri.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        });
      }

      const response = await fetch('https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/postMaintenance.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const jsonResponse = await response.json();
      if (jsonResponse.Status) {
        Alert.alert('Success', 'Post submitted successfully!');
        setTitle('');
        setDescription('');
        setImageUri(null);
      } else {
        Alert.alert('Error', jsonResponse.Message);
      }
    } catch (error) {
      console.error("Error submitting post:", error.message);
      Alert.alert('Error', 'Error submitting post: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.formContainer}>
        <Text style={styles.label}>Maintenance Type </Text>
        <RNPickerSelect
          onValueChange={(value) => setTitle(value)}
          items={[
            { label: 'Road damage', value: 'Road damage' },
            { label: 'Fallen tree', value: 'Fallen tree' },
            { label: 'Clogged canal', value: 'Clogged canal' },
            
          ]}
          placeholder={{
            label: "Select Type",
            value: null,
          }}
          style={{
            inputIOS: styles.input,
            inputAndroid: styles.input,
          }}
          value={title}
        />

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} />
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter your description..."
          multiline={true}
          numberOfLines={5}
          onChangeText={setDescription}
          value={description}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Post</Text>
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
    backgroundColor: '#f0f0f0',
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgb(10, 80, 57)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
  },
});


export default BlogForm;
