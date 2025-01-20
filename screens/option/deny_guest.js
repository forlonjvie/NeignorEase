import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const AccessDenied = () => {
  const [selectedReasons, setSelectedReasons] = useState([]);

  const handleReasonToggle = (reason) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleConfirm = () => {
    
    console.log('Selected reasons:', selectedReasons);
  };

  return (
    <View style={styles.container}>
      <View style={styles.warning}>
        <Text style={styles.warningText}>Warning</Text>
        <Text style={styles.warningMessage}>
          Guest is denied access inside the subdivision. Please provide reason
          for the disapproval of entry.
        </Text>
      </View>
      <View style={styles.reasons}>
        <TouchableOpacity
          style={[
            styles.reason,
            selectedReasons.includes('noAppointment') && styles.selectedReason,
          ]}
          onPress={() => handleReasonToggle('noAppointment')}
        >
          <Text style={styles.reasonText}>
            I did not have an appointment with them.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.reason,
            selectedReasons.includes('notAtHome') && styles.selectedReason,
          ]}
          onPress={() => handleReasonToggle('notAtHome')}
        >
          <Text style={styles.reasonText}>
            I am not at my house at the moment.
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  warning: {
    marginBottom: 20,
  },
  warningText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
  },
  warningMessage: {
    fontSize: 16,
  },
  reasons: {
    marginBottom: 20,
  },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgb(10, 80, 57)',
  },
  selectedReason: {
    backgroundColor: 'rgb(10, 80, 57)',
  },
  reasonText: {
    fontSize: 16,
    color: 'rgb(10, 80, 57)',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    backgroundColor: 'rgb(10, 80, 57)',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AccessDenied;
