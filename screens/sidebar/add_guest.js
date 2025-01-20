import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const AddGuest = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleInitial: '',
    email: '',
    contactNumber: '',
    address: '',
    visitDate: new Date(),
    relation: 'friends',
    otherRelation: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [username, setUsername] = useState('');
  const [homeownerData, setHomeownerData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUsername(parsedData.username);
          const response = await axios.get(`https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getuser.php?username=${parsedData.username}`);
          setHomeownerData(response.data);
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user data');
        navigation.navigate('Login');
      }
    };

    fetchUserData();
  }, [navigation]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRelationChange = (value) => {
    setFormData(prev => ({
      ...prev,
      relation: value,
      otherRelation: value === 'others' ? prev.otherRelation : '',
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        visitDate: selectedDate
      }));
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(09|\+639)\d{9}$/;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.firstName || !formData.lastName || !formData.middleInitial) {
      Alert.alert('Error', 'Please complete the guest name fields');
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!phoneRegex.test(formData.contactNumber)) {
      Alert.alert('Error', 'Please enter a valid Philippine mobile number (e.g., 09123456789)');
      return false;
    }
    if (!formData.address) {
      Alert.alert('Error', 'Please enter guest address');
      return false;
    }
    if (formData.relation === 'others' && !formData.otherRelation) {
      Alert.alert('Error', 'Please specify the relation if "Others" is selected');
      return false;
    }
    if (formData.visitDate < today) {
      Alert.alert('Error', 'Visit date cannot be in the past');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!homeownerData) {
      Alert.alert('Error', 'Homeowner data not loaded');
      return;
    }

    try {
      const postData = {
        guest_fname: formData.firstName,
        guest_lname: formData.lastName,
        guest_mname: formData.middleInitial,
        guest_email: formData.email,
        guest_contact: formData.contactNumber,
        guest_address: formData.address,
        visit_date: formData.visitDate.toISOString().split('T')[0],
        relation: formData.relation === 'others' ? formData.otherRelation : formData.relation,
        ho_username: username,
        ho_housenum: homeownerData.hnum,
        status: 'pending',
      };

      const response = await axios.post(
        'https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/post_visit_request.php',
        postData
      );

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Visit request submitted successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'Failed to submit visit request');
      }
    } catch (error) {
      console.error('Error submitting visit request:', error);
      Alert.alert('Error', 'Failed to submit visit request');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {homeownerData && (
            <View style={styles.homeownerInfo}>
              <Text style={styles.sectionTitle}>Homeowner Details</Text>
              <Text style={styles.infoText}>Name: {homeownerData.fname} {homeownerData.lname}</Text>
              <Text style={styles.infoText}>House Number: {homeownerData.hnum}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Guest Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              placeholder="Enter First Name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Middle Initial *</Text>
            <TextInput
              style={styles.input}
              value={formData.middleInitial}
              onChangeText={(text) => handleInputChange('middleInitial', text)}
              placeholder="Enter Middle Initial"
              placeholderTextColor="#999"
              maxLength={1}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              placeholder="Enter Last Name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.contactNumber}
              onChangeText={(text) => handleInputChange('contactNumber', text)}
              placeholder="09123456789"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              placeholder="Enter Complete Address"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relation *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                selectedValue={formData.relation}
                onValueChange={handleRelationChange}
              >
                <Picker.Item label="Friends" value="friends" />
                <Picker.Item label="Family" value="family" />
                <Picker.Item label="Relatives" value="relatives" />
                <Picker.Item label="Others" value="others" />
              </Picker>
            </View>
          </View>

          {formData.relation === 'others' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specify Relation *</Text>
              <TextInput
                style={styles.input}
                value={formData.otherRelation}
                onChangeText={(text) => handleInputChange('otherRelation', text)}
                placeholder="Specify the relation"
                placeholderTextColor="#999"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Visit Date *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {formData.visitDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.visitDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Visit Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  homeownerInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#495057',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#495057',
  },
  submitButton: {
    backgroundColor: '#0A5039',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddGuest;