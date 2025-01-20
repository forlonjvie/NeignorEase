import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const MaintenanceRequestForm = () => {
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);

  // Handle picking an image
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri); // Set the picked image URI
    }
  };

  // Handle saving image to local directory
  const saveImageLocally = async (uri) => {
    try {
      // Create a folder for images if it doesn't exist
      const folderUri = `${FileSystem.documentDirectory}images/`;
      const folderInfo = await FileSystem.getInfoAsync(folderUri);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(folderUri);
      }

      // Generate a unique file name
      const fileName = uri.split('/').pop(); 
      const newPath = `${folderUri}${fileName}`;

      // Move the image to the new folder
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      Alert.alert('Success', 'Image saved successfully to local folder!');
      return newPath; // Return the new path to the saved image
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (imageUri) {
      const savedImageUri = await saveImageLocally(imageUri);
      setImageUri(savedImageUri); // Update the imageUri to show the saved image
      console.log('Description:', description);
      console.log('Saved Image URI:', savedImageUri);
    } else {
      Alert.alert('Error', 'Please select an image');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>No image selected</Text>
        )}
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Maintenance Request Form</Text>
        <TouchableOpacity style={styles.button} onPress={handlePickImage}>
          <Text style={styles.buttonText}>Add Photo</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Enter your maintenance request..."
          multiline={true}
          numberOfLines={4}
          onChangeText={setDescription}
          value={description}
        />
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    fontSize: 18,
    color: '#aaa',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: 'rgb(10, 80, 57)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default MaintenanceRequestForm;
