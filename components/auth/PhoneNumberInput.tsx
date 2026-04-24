import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

type PhoneNumberInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  editable?: boolean;
  label?: string;
  placeholder?: string;
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
};

const PhoneNumberInput = ({
  value,
  onChangeText,
  error,
  editable = true,
  label = "Phone Number",
  placeholder = "+44 7700 900123",
  autoComplete = "tel",
  textContentType = "telephoneNumber",
}: PhoneNumberInputProps) => {
  return (
    <View>
      <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">
        {label}
      </Text>
      <TextInput
        className="h-14 bg-fdm-fg/5 border-[1.5px] border-fdm-fg/10 rounded-2xl px-4 text-fdm-fg"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        keyboardType="phone-pad"
        autoComplete={autoComplete}
        textContentType={textContentType}
        placeholder={placeholder}
        placeholderTextColor="#ffffff66"
        editable={editable}
      />
      {error ? <Text className="text-red-400 text-sm mt-1">{error}</Text> : null}
    </View>
  );
};

export default PhoneNumberInput;
