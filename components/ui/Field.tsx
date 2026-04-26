import { Text, TextInput, View } from "react-native";

type FieldProps = {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    error?: string;
    keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
    autoComplete?: "name" | "given-name" | "family-name" | "email" | "tel" | "password" | "new-password";
    textContentType?: "name" | "givenName" | "familyName" | "emailAddress" | "telephoneNumber" | "password" | "newPassword";
    editable?: boolean;
    containerClassName?: string;
    multiline?: boolean;
    numberOfLines?: number;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

const Field = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    editable = true,
    keyboardType = "default",
    autoComplete,
    textContentType,
    containerClassName,
    multiline = false,
    numberOfLines,
    autoCapitalize = "sentences",
}: FieldProps) => (
    <View className={containerClassName}>
        <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">
            {label}
        </Text>
        <TextInput
            className={`bg-fdm-fg/5 border-[1.5px] border-fdm-fg/10 rounded-2xl px-4 text-fdm-fg ${multiline ? "py-3 min-h-[100px]" : "h-14"}`}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#ffffff66"
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            autoComplete={autoComplete}
            textContentType={textContentType}
            editable={editable}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? "top" : "center"}
        />
        {error ? <Text className="text-red-400 text-sm mt-1">{error}</Text> : null}
    </View>
);

export default Field;
