import React, {useState} from 'react';
import {Alert, Modal, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import CustomButton from '../../components/CustomButton';
import apiClient from '../../api/Api';
import {COLORS} from '../../shared/Styles';

const ShiftSwappingModal = ({shiftId, onSwap, btnStyles}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [workersData, setWorkersData] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const openModal = () => {
    setModalVisible(!modalVisible);
    fetchWorkers();
  };

  const fetchWorkers = () => {
    apiClient
      .get('/auth/fetchWorkers')
      .then(resp => {
        let workers = resp.data.data;

        workers = workers.map(item => {
          return {
            key: item._id,
            label: item.name,
          };
        });
        setWorkersData(workers);
      })
      .catch(err => {
        console.log('ERROR', err);
      });
  };

  const swapWorker = () => {
    apiClient
      .post('/shift/swapShift', {
        shiftId: shiftId,
        workerId: selectedWorker.key,
      })
      .then(resp => {
        onSwap(shiftId);
        setModalVisible(false);
      })
      .catch(error => {
        console.log('Swapping ERROR', error);
        Alert.alert(
          'Error',
          error?.response?.data?.message ||
            error?.data?.message ||
            'Something went wrong!',
        );
      });
  };

  const handleSubmit = () => {
    if (selectedWorker) {
      swapWorker();
    } else {
      Alert.alert('Error', 'Please select any worker!');
    }
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.container}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Choose member to swap shift</Text>

            <SelectDropdown
              data={workersData}
              onSelect={(selectedItem, index) => {
                setSelectedWorker(selectedItem);
              }}
              // defaultValue={selectedWorker}
              defaultButtonText="Select worker"
              buttonStyle={styles.dropdown1BtnStyle}
              buttonTextStyle={styles.dropdown1BtnTxtStyle}
              renderDropdownIcon={isOpened => {
                return (
                  <FontAwesome
                    name={isOpened ? 'chevron-up' : 'chevron-down'}
                    color={'#444'}
                    size={18}
                  />
                );
              }}
              dropdownIconPosition={'right'}
              dropdownStyle={styles.dropdown1DropdownStyle}
              rowStyle={styles.dropdown1RowStyle}
              rowTextStyle={styles.dropdown1BtnTxtStyle}
              buttonTextAfterSelection={(selectedItem, index) => {
                setSelectedWorker(selectedWorker);
                return selectedItem.label;
              }}
              rowTextForSelection={(item, index) => {
                return item.label;
              }}
            />

            <View style={styles.row}>
              <CustomButton
                title="Submit"
                onPress={handleSubmit}
                parentStyles={{width: '40%'}}
              />

              <CustomButton
                title="Close"
                onPress={() => setModalVisible(false)}
                parentStyles={{
                  width: '40%',
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: COLORS.secondary,
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <CustomButton title="Cancel" onPress={openModal} parentStyles={btnStyles}>
        <Icon name="swap" style={{fontSize: 16, color: '#fff'}} />
      </CustomButton>
    </>
  );
};

export default ShiftSwappingModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  dropdown1BtnStyle: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 0,
    borderBottomWidth: 0.5,
    borderColor: '#444',
    alignSelf: 'center',
  },
  dropdown1BtnTxtStyle: {color: '#444', textAlign: 'left', fontSize: 14},
  dropdown1DropdownStyle: {backgroundColor: '#EFEFEF'},
  dropdown1RowStyle: {
    backgroundColor: '#EFEFEF',
    borderBottomColor: '#C5C5C5',
  },
});
