package com.sorat.game

import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import java.util.concurrent.Executors

@CapacitorPlugin(name = "GoogleAuthPlugin")
class GoogleAuthPlugin : Plugin() {

    private val executor = Executors.newSingleThreadExecutor()

    @PluginMethod
    fun signIn(call: PluginCall) {
        val serverClientId = call.getString("serverClientId")
        if (serverClientId.isNullOrEmpty()) {
            call.reject("serverClientId is required")
            return
        }

        val autoSelect = call.getBoolean("autoSelect", true) ?: true

        bridge.activity.runOnUiThread {
            try {
                val credentialManager = CredentialManager.create(context)
                val googleIdOption = GetGoogleIdOption.Builder()
                    .setFilterByAuthorizedAccounts(false) // Shows all Google accounts logged into the Android device
                    .setServerClientId(serverClientId)
                    .setAutoSelectEnabled(autoSelect) // Automatically select if single account
                    .build()

                val request = GetCredentialRequest.Builder()
                    .addCredentialOption(googleIdOption)
                    .build()

                credentialManager.getCredentialAsync(
                    context,
                    request,
                    null,
                    executor,
                    object : androidx.credentials.CredentialManagerCallback<GetCredentialResponse, GetCredentialException> {
                        override fun onResult(response: GetCredentialResponse) {
                            val credential = response.credential
                            if (credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                                try {
                                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                                    val idToken = googleIdTokenCredential.idToken
                                    authenticateWithFirebase(idToken, call)
                                } catch (e: Exception) {
                                    Log.e(TAG, "Error parsing Google ID Token: ${e.message}", e)
                                    call.reject("Error parsing Google ID Token: ${e.message}")
                                }
                            } else {
                                call.reject("Unexpected credential type: ${credential.type}")
                            }
                        }

                        override fun onError(e: GetCredentialException) {
                            Log.e(TAG, "Credential Manager Error: ${e.type} - ${e.message}", e)
                            if (e is GetCredentialCancellationException) {
                                call.reject("SIGN_IN_CANCELLED", "User cancelled the sign-in prompt.")
                            } else {
                                call.reject("CREDENTIAL_ERROR", e.message)
                            }
                        }
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Exception initializing Credential Manager: ${e.message}", e)
                call.reject("Exception initializing Credential Manager: ${e.message}")
            }
        }
    }

    private fun authenticateWithFirebase(idToken: String, call: PluginCall) {
        val auth = FirebaseAuth.getInstance()
        val credential = GoogleAuthProvider.getCredential(idToken, null)

        auth.signInWithCredential(credential)
            .addOnCompleteListener(bridge.activity) { task ->
                if (task.isSuccessful) {
                    val user = auth.currentUser
                    if (user != null) {
                        val ret = JSObject().apply {
                            put("uid", user.uid)
                            put("email", user.email)
                            put("displayName", user.displayName)
                            put("photoUrl", user.photoUrl?.toString() ?: "")
                            put("idToken", idToken)
                        }
                        call.resolve(ret)
                    } else {
                        call.reject("Firebase user is null after sign in")
                    }
                } else {
                    val exception = task.exception
                    val errMsg = exception?.message ?: "Firebase Auth failed"
                    Log.e(TAG, "Firebase Authentication failed: $errMsg", exception)
                    call.reject("FIREBASE_AUTH_FAILED", errMsg)
                }
            }
    }

    @PluginMethod
    fun getCurrentUser(call: PluginCall) {
        val user = FirebaseAuth.getInstance().currentUser
        val ret = JSObject()
        if (user != null) {
            ret.put("uid", user.uid)
            ret.put("email", user.email)
            ret.put("displayName", user.displayName)
            ret.put("photoUrl", user.photoUrl?.toString() ?: "")
            call.resolve(ret)
        } else {
            ret.put("user", null)
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun signOut(call: PluginCall) {
        FirebaseAuth.getInstance().signOut()
        val ret = JSObject().apply {
            put("success", true)
        }
        call.resolve(ret)
    }

    companion object {
        private const val TAG = "GoogleAuthPlugin"
    }
}
