package com.sorat.game;

import android.content.Context;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import com.google.android.libraries.identity.googleid.GetGoogleIdOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GoogleAuthProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "GoogleAuthPlugin")
public class GoogleAuthPlugin extends Plugin {
    private static final String TAG = "GoogleAuthPlugin";
    private final Executor executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void signIn(PluginCall call) {
        String serverClientId = call.getString("serverClientId");
        if (serverClientId == null || serverClientId.isEmpty()) {
            call.reject("serverClientId is required");
            return;
        }

        boolean autoSelect = call.getBoolean("autoSelect", true);

        // Run on the main UI thread as Credential Manager requires an Activity context and UI interaction
        getBridge().getActivity().runOnUiThread(() -> {
            try {
                CredentialManager credentialManager = CredentialManager.create(getContext());

                // Set up Google ID Option
                GetGoogleIdOption googleIdOption = new GetGoogleIdOption.Builder()
                        .setFilterByAuthorizedAccounts(false) // Show all Google accounts on the device
                        .setServerClientId(serverClientId)
                        .setAutoSelectEnabled(autoSelect) // If true, auto-sign in if only one account exists
                        .build();

                GetCredentialRequest request = new GetCredentialRequest.Builder()
                        .addCredentialOption(googleIdOption)
                        .build();

                credentialManager.getCredentialAsync(
                        getContext(),
                        request,
                        null, // Cancellation signal
                        executor,
                        new androidx.credentials.CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                            @Override
                            public void onResult(GetCredentialResponse response) {
                                Credential credential = response.getCredential();
                                if (credential.getType().equals(GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL)) {
                                    try {
                                        GoogleIdTokenCredential googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.getData());
                                        String idToken = googleIdTokenCredential.getIdToken();
                                        
                                        // Authenticate with Firebase Auth
                                        authenticateWithFirebase(idToken, call);
                                    } catch (Exception e) {
                                        Log.e(TAG, "Error parsing Google ID Token: " + e.getMessage(), e);
                                        call.reject("Error parsing Google ID Token: " + e.getMessage());
                                    }
                                } else {
                                    call.reject("Unexpected credential type: " + credential.getType());
                                }
                            }

                            @Override
                            public void onError(GetCredentialException e) {
                                Log.e(TAG, "Credential Manager Error: " + e.getType() + " - " + e.getMessage(), e);
                                if (e instanceof GetCredentialCancellationException) {
                                    call.reject("SIGN_IN_CANCELLED", "User cancelled the sign-in prompt.");
                                } else {
                                    call.reject("CREDENTIAL_ERROR", e.getMessage());
                                }
                            }
                        }
                );

            } catch (Exception e) {
                Log.e(TAG, "Exception initializing Credential Manager: " + e.getMessage(), e);
                call.reject("Exception initializing Credential Manager: " + e.getMessage());
            }
        });
    }

    private void authenticateWithFirebase(String idToken, PluginCall call) {
        FirebaseAuth auth = FirebaseAuth.getInstance();
        AuthCredential credential = GoogleAuthProvider.getCredential(idToken, null);
        
        auth.signInWithCredential(credential)
                .addOnCompleteListener(getBridge().getActivity(), new OnCompleteListener<AuthResult>() {
                    @Override
                    public void onComplete(@NonNull Task<AuthResult> task) {
                        if (task.isSuccessful()) {
                            FirebaseUser user = auth.getCurrentUser();
                            if (user != null) {
                                JSObject ret = new JSObject();
                                ret.put("uid", user.getUid());
                                ret.put("email", user.getEmail());
                                ret.put("displayName", user.getDisplayName());
                                ret.put("photoUrl", user.getPhotoUrl() != null ? user.getPhotoUrl().toString() : "");
                                ret.put("idToken", idToken);
                                call.resolve(ret);
                            } else {
                                call.reject("Firebase user is null after sign in");
                            }
                        } else {
                            Exception exception = task.getException();
                            String errMsg = exception != null ? exception.getMessage() : "Firebase Auth failed";
                            Log.e(TAG, "Firebase Authentication failed: " + errMsg, exception);
                            call.reject("FIREBASE_AUTH_FAILED", errMsg);
                        }
                    }
                });
    }

    @PluginMethod
    public void getCurrentUser(PluginCall call) {
        FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
        if (user != null) {
            JSObject ret = new JSObject();
            ret.put("uid", user.getUid());
            ret.put("email", user.getEmail());
            ret.put("displayName", user.getDisplayName());
            ret.put("photoUrl", user.getPhotoUrl() != null ? user.getPhotoUrl().toString() : "");
            call.resolve(ret);
        } else {
            // Return empty object or null representation
            JSObject ret = new JSObject();
            ret.put("user", null);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void signOut(PluginCall call) {
        FirebaseAuth.getInstance().signOut();
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}
