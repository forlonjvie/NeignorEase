import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';

// Function to verify OTP
const fetchOTPVerification = async (otp, setOTPValid, setOtpData, setModalVisible, setOtpDetails) => {
  const OTPVerificationURL = "http://192.168.43.178/12_18/4Capstone/app/guard/db_connection/getOTP.php";

  try {
    const response = await fetch(OTPVerificationURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp }),
    });
    
    const jsonResponse = await response.json();
    if (jsonResponse.Status && jsonResponse.Data.length > 0) {
      const otpData = jsonResponse.Data[0];  // Assuming one result for OTP
      setOTPValid(true);  // Set the OTP as valid
      setOtpData(otpData.guest_name); // Store guest name instead of OTP
      setOtpDetails(otpData); // Set OTP details for modal
      setModalVisible(true); // Show the modal
      Alert.alert("OTP verified successfully!");
    } else {
      Alert.alert(jsonResponse.Message);
    }
  } catch (error) {
    Alert.alert("Error: " + error.message);
  }
};

// Function to save log entry for entry/exit
const saveLog = async (guestName, point, setOtpData, setOTPValid, setOtp, setModalVisible) => {
  const saveLogURL = "http://192.168.43.178/12_18/4Capstone/app/guard/db_connection/save_log.php";

  try {
    const response = await fetch(saveLogURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: guestName, point }),
    });

    const jsonResponse = await response.json();
    if (jsonResponse.status === "success") {
      Alert.alert("Log saved successfully!");
      // Clear OTP field and hide Entry and Exit buttons
      setOtpData(null);
      setOTPValid(false);
      setOtp('');  // Clear OTP input field
      setModalVisible(false); // Hide the modal
    } else {
      Alert.alert(jsonResponse.message);
    }
  } catch (error) {
    Alert.alert("Error: " + error.message);
  }
};

const App = ({ navigation }) => {
  const [otp, setOtp] = useState('');
  const [isOTPValid, setOTPValid] = useState(false);  // To track OTP validation
  const [otpData, setOtpData] = useState(null); // To store guest name after validation
  const [modalVisible, setModalVisible] = useState(false); // To control modal visibility
  const [otpDetails, setOtpDetails] = useState(null); // To store OTP details for modal

  const handleVerify = () => {
    fetchOTPVerification(otp, setOTPValid, setOtpData, setModalVisible, setOtpDetails);
  };

  const handleEntry = () => {
    if (otpData) {
      saveLog(otpData, "ENTRY", setOtpData, setOTPValid, setOtp, setModalVisible);  // Save entry log using guest name
    }
  };

  const handleExit = () => {
    if (otpData) {
      saveLog(otpData, "EXIT", setOtpData, setOTPValid, setOtp, setModalVisible);  // Save exit log using guest name
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => navigation.navigate('guard_HO_Very')} // Navigate to GuardHO_Very
      >
        <Text style={styles.refreshText}>⟳</Text>
      </TouchableOpacity>

      <Text style={styles.title}>OTP Verification</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
        <Text style={styles.verifyText}>Verify OTP</Text>
      </TouchableOpacity>

      {/* Modal for OTP details and Entry/Exit buttons */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>OTP Details</Text>
            {otpDetails && (
              <View>
                <Text>Guest Name: {otpDetails.guest_name}</Text>
                <Text>Validity: {otpDetails.Validity}</Text>
                {/* Add other details as needed */}
              </View>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalEntryButton} onPress={handleEntry}>
                <Text style={styles.buttonText}>Entry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalExitButton} onPress={handleExit}>
                <Text style={styles.buttonText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  verifyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    elevation: 4,
  },
  closeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    elevation: 4,
  },
  refreshText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalEntryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  modalExitButton: {
    backgroundColor: '#f44336',
    paddingVertical: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default App;
