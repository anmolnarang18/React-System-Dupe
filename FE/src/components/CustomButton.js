import React from 'react';
import {
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {COLORS} from '../shared/Styles';

const CustomButton = ({title = 'N/A', isLoading, onPress, parentStyles, textStyles, children}) => {
  return (
    <TouchableOpacity style={[styles.btn, parentStyles]} onPress={onPress}>
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.secondary} />
      ) : (
        children?children:
        <Text style={[styles.btnText, textStyles]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: '5%',
    paddingVertical: '3%',
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginTop:'3%'
  },
  btnText: {color: COLORS.secondary, fontSize: 14, fontWeight: '700'},
});

export default CustomButton;
