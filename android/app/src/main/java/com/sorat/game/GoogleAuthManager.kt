package com.sorat.game

import android.content.Context
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser

object GoogleAuthManager {

    fun getCurrentUser(): FirebaseUser? {
        return FirebaseAuth.getInstance().currentUser
    }

    fun isUserSignedIn(): Boolean {
        return getCurrentUser() != null
    }

    fun signOut() {
        FirebaseAuth.getInstance().signOut()
    }
}
