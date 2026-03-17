import { router } from 'expo-router'
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

// Components
import FormTextInput from './TextInput'

type RegisterFormProps = {
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string,
    confirmPassword: string,
    firstNameError: string,
    lastNameError: string,
    emailError: string,
    phoneNumberError: string,
    passwordError: string,
    confirmPasswordError: string,
    formError: string,
    setFirstName: (value: string) => void,
    setLastName: (value: string) => void,
    setEmail: (value: string) => void,
    setPhoneNumber: (value: string) => void,
    setPassword: (value: string) => void,
    setConfirmPassword: (value: string) => void,
    onSubmitStepOne: () => void,
}

export default function RegisterForm({ firstName, lastName, email, phoneNumber, password, confirmPassword, firstNameError, lastNameError, emailError, phoneNumberError, passwordError, confirmPasswordError, formError, setFirstName, setLastName, setEmail, setPhoneNumber, setPassword, setConfirmPassword, onSubmitStepOne }: RegisterFormProps) {
    return (
        <>
            <ScrollView
                className="flex-1 w-full"
                contentContainerStyle={{ paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="w-full max-w-sm self-center z-10">
                    {/* Title */}
                    <View className="items-center mt-3 mb-10 w-full">
                        <Text className="text-fdm-fg text-3xl mb-3 tracking-tighter text-center" style={{ fontFamily: "Michroma_400Regular" }}>
                            Create <Text className="text-fdm-accent">Account</Text>
                        </Text>
                        <Text className="text-fdm-fg/50 text-sm text-center">Join the FDM community</Text>
                    </View>

                    {/* Form Fields */}
                    <View className="w-full gap-3">

                        {/* Name fields */}
                        <View className="w-full flex-row gap-3">
                            <View className="flex-1">
                                <FormTextInput 
                                    label = "First Name"
                                    icon = "person-outline"
                                    placeholder="John"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                                {firstNameError ? <Text className="text-red-400 text-sm mt-1">{firstNameError}</Text> : null}
                            </View>
                            <View className="flex-1">
                                <FormTextInput 
                                    label = "Last Name"
                                    placeholder="Doe"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                                {lastNameError ? <Text className="text-red-400 text-sm mt-1">{lastNameError}</Text> : null}
                            </View>
                        </View>

                        {/* Email */}
                        <View>
                            <FormTextInput
                                label = "Email"
                                icon = "mail-outline"
                                placeholder="you@fdmgroup.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={email}
                                onChangeText={setEmail}
                            />
                            {emailError ? <Text className="text-red-400 text-sm mt-1">{emailError}</Text> : null}
                        </View>

                        {/* Phone */}
                        <View>
                            <FormTextInput
                                label = "Phone Number"
                                icon = "call-outline"
                                placeholder="+44 7700 900000"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                            />
                            {phoneNumberError ? <Text className="text-red-400 text-sm mt-1">{phoneNumberError}</Text> : null}
                        </View>

                        {/* Password */}
                        <View>
                            <FormTextInput
                                label = "Password"
                                icon = "lock-closed-outline"
                                placeholder="••••••••"
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={password}
                                onChangeText={setPassword}
                            />
                            {passwordError ? <Text className="text-red-400 text-sm mt-1">{passwordError}</Text> : null}
                        </View>

                        {/* Confirm Password */}
                        <View>
                            <FormTextInput
                                label = "Confirm Password"
                                icon = "lock-closed-outline"
                                placeholder="••••••••"
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            {confirmPasswordError ? <Text className="text-red-400 text-sm mt-1">{confirmPasswordError}</Text> : null}
                        </View>

                        {formError ? <Text className="text-red-400 text-sm mt-1">{formError}</Text> : null}
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        className="w-2/3 self-center bg-fdm-accent py-4 rounded-2xl items-center shadow-lg shadow-fdm-accent/20 active:opacity-80 transition-opacity mt-8"
                        onPress={onSubmitStepOne}
                    >
                        <Text className="text-fdm-bg font-bold tracking-wide uppercase">
                            Create Account
                        </Text>
                    </TouchableOpacity>

                    {/* Switch to login */}
                    <View className="flex-row justify-center items-center mt-6 gap-1">
                        <Text className="text-fdm-fg/50 text-sm">Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                            <Text className="text-fdm-accent font-semibold text-sm"> Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </>
    )
}