import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

const MaintenanceTypes = [
  { label: 'Road Damage', value: 'road_damage' },
  { label: 'Fallen Tree', value: 'fallen_tree' },
  { label: 'Clogged Canal', value: 'clogged_canal' },
  { label: 'Street Light Issue', value: 'street_light' },
  { label: 'Broken Sidewalk', value: 'broken_sidewalk' },
  { label: 'Drainage Problem', value: 'drainage' },
];

const BlogForm = () => {
  const [formState, setFormState] = useState({
    description: '',
    imageUri: null,
    title: '',
    isSubmitting: false,
    charCount: 0,
  });
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserData();
    requestImagePermissions();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data. Please login again.');
    }
  };

  const requestImagePermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormState(prev => ({ ...prev, imageUri: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const validateForm = () => {
    if (!formState.title) return 'Please select a maintenance type';
    if (!formState.description) return 'Please provide a description';
    if (formState.description.length < 20) return 'Description must be at least 20 characters';
    if (!user?.username) return 'Please login to submit a report';
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const formData = new FormData();
      formData.append('title', formState.title);
      formData.append('description', formState.description);
      formData.append('username', user.username);

      if (formState.imageUri) {
        const filename = formState.imageUri.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;
        formData.append('image', { uri: formState.imageUri, name: filename, type });
      }

      const response = await fetch('https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/postMaintenance.php', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = await response.json();
      
      if (result.Status) {
        Alert.alert('Success', 'Maintenance report submitted successfully!');
        setFormState({
          description: '',
          imageUri: null,
          title: '',
          isSubmitting: false,
          charCount: 0,
        });
      } else {
        throw new Error(result.Message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.formTitle}>Maintenance Report</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Issue Type</Text>
          <RNPickerSelect
            onValueChange={(value) => setFormState(prev => ({ ...prev, title: value }))}
            items={MaintenanceTypes}
            placeholder={{ label: "Select maintenance type", value: null }}
            style={pickerSelectStyles}
            value={formState.title}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide detailed information about the issue..."
            multiline
            numberOfLines={5}
            onChangeText={(text) => setFormState(prev => ({ 
              ...prev, 
              description: text,
              charCount: text.length
            }))}
            value={formState.description}
          />
          <Text style={styles.charCount}>
            {formState.charCount}/500 characters
          </Text>
        </View>

        {formState.imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: formState.imageUri }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removeImage}
              onPress={() => setFormState(prev => ({ ...prev, imageUri: null }))}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.submitButton, formState.isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={formState.isSubmitting}>
          {formState.isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={handlePickImage}
        disabled={formState.isSubmitting}>
        <Icon name="add-a-photo" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  imageContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#1976D2',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    color: '#333',
    backgroundColor: '#fff',
  },
};

export default BlogForm;