import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TextInputProps, View } from "react-native";

type FormTextInputProps = {
    label: string,
    placeholder: string,
    value?: string,
    onChangeText: (value: string) => void,
    icon?: keyof typeof Ionicons.glyphMap,
    secureTextEntry?: boolean,
    keyboardType?: TextInputProps["keyboardType"],
    autoCapitalize?: TextInputProps["autoCapitalize"],
    autoCorrect?: boolean,
}

export default function FormTextInput({ label, icon, placeholder, value, onChangeText, secureTextEntry = false, keyboardType, autoCapitalize = "sentences", autoCorrect = true }: FormTextInputProps) {
    return (
        <>
        <View>
                <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">{ label }</Text> 
                <View className="h-17 bg-fdm-fg/5 border-[1.5px] border-fdm-fg/10 rounded-2xl px-4 py-3 flex-row items-center">
                        {icon ? <Ionicons name={icon} size={20} color="#ffffff80" /> : null}
                        <TextInput
                                className={`flex-1 text-fdm-fg text-base ${icon ? "ml-3" : ""}`}
                                placeholder={placeholder}
                                placeholderTextColor="#ffffff50"
                                secureTextEntry={secureTextEntry}
                                keyboardType={keyboardType}
                                autoCapitalize={autoCapitalize}
                                autoCorrect={autoCorrect}
                                value={value}
                                onChangeText={onChangeText}
                        />
                </View>
        </View>
        </>
    );
}